import { useEffect, useState } from "react";
import { ChevronLeft, Loader2, Pencil, Trash2, Save, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/explore.css";
import Cropper from "react-easy-crop";
import girlDisplay from "../assets/girl-display.png";
import { useNavigate } from "react-router-dom";


type Profile = {
  id: string;
  full_name: string;
  gender: string;
  dob: string;
  age: number;
  father_name: string;
  paternal_grandfather: string;
  maternal_grandfather: string;
  education: string;
  occupation: string;
  university_name: string;
  school_name: string;
  current_residence: string;
  description: string;
  contact_person: string;
  contact_number: string;
  approved: boolean;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profile_pic: string | null;
  is_deleted: boolean;
  deleted_by_user?: boolean; // optional column if you add
};

export default function EditProfile() {

  
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
    // password modal state (for edit + delete)

const [appMessage, setAppMessage] = useState("");
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
const [showCrop, setShowCrop] = useState(false);
const [imagePreview, setImagePreview] = useState<string>('');
const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);


 

  const myProfileId = localStorage.getItem("mangni_profile_id");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

const showToast = (message: string, type: "success" | "error" = "success") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 6000);
};


  

  useEffect(() => {
    fetchMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMyProfile() {
    try {
      setLoading(true);

      if (!myProfileId) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", myProfileId)
        .maybeSingle();

      if (error) throw error;

      setProfile(data as Profile);
      setForm(data as Profile);
    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }
  function handleEditImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  setImagePreview(URL.createObjectURL(file));
  setShowCrop(true);
}
async function uploadEditedPhoto(blob: Blob) {
  const fileName = `${crypto.randomUUID()}.jpg`;

  await supabase.storage.from("profile-photos").upload(fileName, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  

  const { data } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

  const imageUrl = data.publicUrl + "?t=" + Date.now();

  await supabase.from("profiles")
    .update({ profile_pic: imageUrl })
    .eq("id", profile?.id);

  setForm(prev => ({ ...prev, profile_pic: imageUrl }));
  setProfile(prev => prev ? { ...prev, profile_pic: imageUrl } : prev);

  showToast("Photo updated successfully", "success");
}




  function statusMessage(p: Profile) {
    if (p.is_deleted) return "You deleted this profile. It is not public now.";
    if (p.status === "approved" || p.approved) return "Profile Approved! Your profile is now visible to Mangni users.";
    if (p.status === "rejected") return ` Rejected: ${p.rejection_reason || "No reason provided"}`;
    return "Pending Review: Your profile has been submitted, Syed Hurriyath will review it shortly. Thank you.";
  }

  



  function setField(key: keyof Profile, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
 
async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file || !profile?.id) return;

  try {
    setSaving(true);

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // ✅ ALWAYS NEW FILE (NO UPSERT)
    const ext = file.name.split(".").pop();
    const filePath = `profiles/${profile.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos") // ✅ CORRECT BUCKET
      .upload(filePath, file); // ❌ NO upsert

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("profile-photos") // ✅ CORRECT BUCKET
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        profile_pic: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (dbError) {
      console.error("DB ERROR:", dbError);
      alert(dbError.message);
      return;
    }

    // ✅ UPDATE UI
    setForm((p) => ({ ...p, profile_pic: imageUrl }));
    setProfile((p) => (p ? { ...p, profile_pic: imageUrl } : p));
    setPhotoSuccess(true);
    setTimeout(() => setPhotoSuccess(false),7000);

  } catch (err: any) {
  console.error("FULL ERROR OBJECT:", err);
  alert(err?.message || JSON.stringify(err));
}finally {
    setSaving(false);
  }
}

  async function submitEdit() {
  if (!profile?.id) return;

  try {
    setSaving(true);
    
    // ✅ ADD THIS BLOCK - Upload photo if there's a pending one
    let finalPhotoUrl = form.profile_pic;
    if (pendingPhoto) {
      const blob = await fetch(pendingPhoto).then(r => r.blob());
      const fileName = `${crypto.randomUUID()}.jpg`;
      
      await supabase.storage.from("profile-photos").upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });
      
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(fileName);
      finalPhotoUrl = data.publicUrl + "?t=" + Date.now();
    }
    // ✅ END OF ADDED BLOCK

    const isAlreadyApproved = profile?.approved === true;
    const payload: any = {
      full_name: form.full_name?.trim() || null,
      father_name: form.father_name?.trim() || null,
      paternal_grandfather: form.paternal_grandfather?.trim() || null,
      maternal_grandfather: form.maternal_grandfather?.trim() || null,
      education: form.education?.trim() || null,
      occupation: form.occupation?.trim() || null,
      university_name: form.university_name?.trim() || null,
      school_name: form.school_name?.trim() || null,
      current_residence: form.current_residence?.trim() || null,
      contact_person: form.contact_person?.trim() || null,
      contact_number: form.contact_number?.trim() || null,
      description: form.description?.trim() || null,
      dob: form.dob ? form.dob : null,
      age: form.age ? Number(form.age) : null,
      profile_pic: finalPhotoUrl,  // ✅ ADD THIS LINE
      updated_at: new Date().toISOString(),
    };
    
    // ... rest of your code stays the same
    if (!isAlreadyApproved) {
      payload.status = "pending";
      payload.approved = false;
      payload.rejection_reason = null;
    }

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", profile.id);

    if (error) throw error;

    // ✅ ADD THIS - Clear pending photo after save
    setPendingPhoto(null);
    
    showToast("Profile updated successfully", "success");
    setEditMode(false);
    await fetchMyProfile();
  } catch (e) {
    console.error(e);
    alert("Failed to update profile.");
  } finally {
    setSaving(false);
  }
}

  async function deleteProfile() {
  if (!profile?.id) return;



  try {
    setSaving(true);
// saving log for log table history 
await supabase.from("deleted_profiles").insert({
      original_profile_id: profile.id,
      full_name: profile.full_name,
      gender: profile.gender,
      deleted_by: "user",
      profile_data: profile, // full backup
    });
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profile.id);

    if (error) throw error;

    localStorage.removeItem("mangni_profile_id");
    navigate('/');
  } catch (e: any) {
    alert("Failed to delete: " + e.message);
  } finally {
    setSaving(false);
  }
}


  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <button className="profile-back" onClick={() => navigate('/')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="profile-title">My Profile</div>
          <div style={{ width: 44 }} />
        </div>
        <div className="profile-loading">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <button className="profile-back" onClick={() => navigate('/')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="profile-title">My Profile</div>
          <div style={{ width: 44 }} />
        </div>

        <div className="profile-empty">
          <h2>No profile found</h2>
          <p>Create your profile first.</p>
          <button className="primary-btn" onClick={() => navigate("/add-profile")}>
            Add Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="profile-back" onClick={() => (editMode ? setEditMode(false) :navigate('/'))}>
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="profile-title">{editMode ? "Edit Profile" : "My Profile"}</div>

        {!editMode ? (
          <button 
            type = "button"
            className="profile-icon-btn" onClick={() => ("edit")} title="Edit">
            <Pencil className="w-5 h-5" />
          </button>
        ) : (
          <button className="profile-icon-btn" onClick={() => setEditMode(false)} title="Cancel">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Photo */}
      {/* Profile Photo Section */}
<div className="profile-hero">
  <img
  src={
    profile.gender === "female"
      ? girlDisplay
      : (editMode && pendingPhoto) 
        ? pendingPhoto  // Show selected photo in edit mode
        : (editMode ? form.profile_pic : profile.profile_pic) || ''
  }
  className={`profile-hero-img ${profile.gender === "female" ? "girl-img" : ""}`}
/>

  {photoSuccess && (
  <div className="photo-success-msg">
   ✅ Profile photo updated successfully
  </div>
)}


  {editMode && profile.gender === "male" && (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    marginTop: '12px',
    marginBottom: '20px',
  }}>
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '40px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
    }}>
      📷 Change Photo
      <input type="file" hidden accept="image/*" onChange={handleEditImageUpload} />
    </label>
  </div>
)}
</div>



      {/* Status message */}
      <div className="profile-name-block">
        <h1>{profile.full_name}</h1>
       

        
      </div>

      {/* VIEW MODE */}
      {!editMode ? (
  <div className="profile-view-mode">
    
    {/* Status Card - Single */}
    <div className={`status-single ${profile.status}`}>
      <div className="status-icon">
        {profile.status === 'approved' && '✅'}
        {profile.status === 'pending' && '⏳'}
        {profile.status === 'rejected' && '❌'}
      </div>
      <div className="status-text">
        {statusMessage(profile)}
        {profile.status === "rejected" && profile.rejection_reason && (
          <div className="status-reason">Reason: {profile.rejection_reason}</div>
        )}
      </div>
    </div>

    {/* Quick Info - Vertical Stack */}
    <div className="quick-info-vertical">
      <div className="info-row">
        <span className="info-label">Age</span>
        <span className="info-value">{profile.age} years</span>
      </div>
      <div className="info-row">
        <span className="info-label">Gender</span>
        <span className="info-value">{profile.gender === 'male' ? 'Male' : 'Female'}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Occupation</span>
        <span className="info-value">{profile.occupation || '—'}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Residence</span>
        <span className="info-value">{profile.current_residence || '—'}</span>
      </div>
    </div>

    {/* Personal Information */}
    <div className="info-card">
      <h3 className="card-title">Personal Information</h3>
      <div className="card-content">
        <div className="card-row">
          <span className="row-label">Full Name</span>
          <span className="row-value">{profile.full_name || '—'}</span>
        </div>
        <div className="card-row">
          <span className="row-label">Father's Name</span>
          <span className="row-value">{profile.father_name || '—'}</span>
        </div>
      </div>
    </div>

    {/* Family Background */}
    <div className="info-card">
      <h3 className="card-title">Family Background</h3>
      <div className="card-content">
        <div className="card-row">
          <span className="row-label">Paternal Grandfather</span>
          <span className="row-value">{profile.paternal_grandfather || '—'}</span>
        </div>
        <div className="card-row">
          <span className="row-label">Maternal Grandfather</span>
          <span className="row-value">{profile.maternal_grandfather || '—'}</span>
        </div>
      </div>
    </div>

    {/* Education & Work */}
    <div className="info-card">
      <h3 className="card-title">Education & Work</h3>
      <div className="card-content">
        <div className="card-row">
          <span className="row-label">Education</span>
          <span className="row-value">{profile.education || '—'}</span>
        </div>
        <div className="card-row">
          <span className="row-label">University</span>
          <span className="row-value">{profile.university_name || '—'}</span>
        </div>
        <div className="card-row">
          <span className="row-label">School</span>
          <span className="row-value">{profile.school_name || '—'}</span>
        </div>
      </div>
    </div>

    {/* Contact Information */}
    <div className="info-card">
      <h3 className="card-title">Contact Information</h3>
      <div className="card-content">
        <div className="card-row">
          <span className="row-label">Contact Person</span>
          <span className="row-value">{profile.contact_person || '—'}</span>
        </div>
        <div className="card-row">
          <span className="row-label">Contact Number</span>
          <span className="row-value">{profile.contact_number || '—'}</span>
        </div>
      </div>
    </div>

    {/* About */}
    {profile.description && (
      <div className="info-card">
        <h3 className="card-title">About</h3>
        <div className="about-content">{profile.description}</div>
      </div>
    )}

    {/* Created Date */}
    <div className="created-date">
      Created: {new Date(profile.created_at).toDateString()}
    </div>

    {/* Action Buttons */}
    <div className="view-actions">
      <button className="btn-edit" onClick={() => setEditMode(true)}>
        ✏️ Edit Profile
      </button>
      <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)} disabled={saving}>
        🗑️ Delete Profile
      </button>
    </div>

  </div>
  
      ) : (
  <div className="edit-page">
    {/* Edit Form Card */}
    <div className="edit-form-card">
      
      {/* Personal Information Section */}
      <div className="form-section">
        <div className="form-section-title">Personal Information</div>
        
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            value={form.full_name || ""}
            onChange={(e) => setField("full_name", e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Current Residence</label>
          <input
            className="form-input"
            value={form.current_residence || ""}
            onChange={(e) => setField("current_residence", e.target.value)}
            placeholder="City, State"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Occupation</label>
          <select
            className="form-input"
            value={form.occupation || ""}
            onChange={(e) => setField("occupation", e.target.value)}
          >
            <option value="">Select occupation</option>
            <option value="Student">Student</option>
            <option value="Business">Business</option>
            <option value="Job">Job</option>
            <option value="Gemstones Business">GemStones Business</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Family Information Section */}
      <div className="form-section">
        <div className="form-section-title">Family Information</div>
        
        <div className="form-group">
          <label className="form-label">Father's Name</label>
          <input
            className="form-input"
            value={form.father_name || ""}
            onChange={(e) => setField("father_name", e.target.value)}
            placeholder="Enter father's name"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Paternal Grandfather</label>
            <input
              className="form-input"
              value={form.paternal_grandfather || ""}
              onChange={(e) => setField("paternal_grandfather", e.target.value)}
              placeholder="Grandfather name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Maternal Grandfather</label>
            <input
              className="form-input"
              value={form.maternal_grandfather || ""}
              onChange={(e) => setField("maternal_grandfather", e.target.value)}
              placeholder="Grandfather name"
            />
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="form-section">
        <div className="form-section-title">Education</div>
        
        <div className="form-group">
          <label className="form-label">Education</label>
          <input
            className="form-input"
            value={form.education || ""}
            onChange={(e) => setField("education", e.target.value)}
            placeholder="e.g., Bachelor's in Computer Science"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">University <span className="optional">(if any)</span></label>
            <input
              className="form-input"
              value={form.university_name || ""}
              onChange={(e) => setField("university_name", e.target.value)}
              placeholder="University name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">School</label>
            <input
              className="form-input"
              value={form.school_name || ""}
              onChange={(e) => setField("school_name", e.target.value)}
              placeholder="School name"
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="form-section">
        <div className="form-section-title">Contact Information</div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input
              className="form-input"
              value={form.contact_person || ""}
              onChange={(e) => setField("contact_person", e.target.value)}
              placeholder="Name of contact person"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              className="form-input"
              value={form.contact_number || ""}
              onChange={(e) => setField("contact_number", e.target.value)}
              placeholder="Phone number"
              type="tel"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="form-section">
        <div className="form-section-title">About Me</div>
        
        <div className="form-group">
          <textarea
            className="form-textarea"
            rows={4}
            value={form.description || ""}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Tell us about yourself, your interests, and what you're looking for..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="edit-actions">
        <button className="btn-save" onClick={submitEdit} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Update Profile'}
        </button>

        <button 
  className="btn-cancel" 
  onClick={() => {
    setEditMode(false);
    setPendingPhoto(null);  // ✅ Discard pending photo
    setForm(profile as Profile);  // ✅ Reset form to original
  }} 
  disabled={saving}
>
  Cancel
</button>
      </div>

    </div>
  </div>
)}    
     
{showDeleteConfirm && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>Are you sure you want to delete your profile?</h3>

      <div className="modal-actions">
        <button
          className="secondary-btn"
          onClick={() => setShowDeleteConfirm(false)}
        >
          Cancel
        </button>

        <button
          className="danger-btn"
          onClick={async () => {
            setShowDeleteConfirm(false);
            await deleteProfile();
          
          }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

  {toast && (
  <div style={{
    position: 'fixed',
    bottom: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '40px',
    fontSize: '13px',
    fontWeight: '500',
    zIndex: 9999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  }}>
    {toast.message}
  </div>
)}  

{showCrop && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-96">
      <div className="relative w-full h-64">
        <Cropper
          image={imagePreview}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_,pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>

      <div className="mt-4 flex justify-between">
        <button onClick={() => setShowCrop(false)} className="px-4 py-2 border rounded">
          Cancel
        </button>

        <button
  onClick={async () => {
    const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
    const blob = await fetch(croppedImage).then(r => r.blob());
    setCroppedBlob(blob);
    setPendingPhoto(croppedImage);  // <-- STORE, NOT UPLOAD
    setImagePreview(croppedImage);
    setShowCrop(false);
    showToast("Photo selected - click Save to keep", "success");  // <-- OPTIONAL TOAST
  }}
  className="px-4 py-2 bg-amber-500 text-white rounded"
>
  Done
</button>

      </div>
    </div>
  </div>
)}

      
    </div>
  );
}

function Row({
  label,
  value,
  multiline,
  full,
}: {
  label: string;
  value?: any;
  multiline?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`profile-item ${full ? "full" : ""}`}>
      <div className="profile-item-label">{label}</div>
      <div className={multiline ? "profile-item-value multiline" : "profile-item-value"}>
        {value || "—"}
      </div>
    </div>
  );
}


function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="profile-input">
      <label className="profile-input-label">{label}</label>
      <input className="profile-input-control" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="profile-input">
      <label className="profile-input-label">{label}</label>
      <textarea
        className="profile-input-control textarea"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
    
  ); 
}
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });
}

async function getCroppedImg(imageSrc: string, crop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return canvas.toDataURL("image/jpeg");
}
