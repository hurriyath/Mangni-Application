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
    if (p.status === "approved" || p.approved) return "✅ Your profile is approved and visible publicly.";
    if (p.status === "rejected") return `❌ Rejected: ${p.rejection_reason || "No reason provided"}`;
    return "🟡 Pending: Your profile is under admin review.";
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
      contact_person: form.contact_person?.trim() || null,   // ✅
  contact_number: form.contact_number?.trim() || null,   // ✅
      description: form.description?.trim() || null,

      // ✅ never send "" for date/int
      dob: form.dob ? form.dob : null,
      age: form.age ? Number(form.age) : null,

      updated_at: new Date().toISOString(),
    };
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
      : (editMode ? form.profile_pic : profile.profile_pic) || boyDefault
  }
  className={`profile-hero-img ${profile.gender === "female" ? "girl-img" : ""}`}
/>

  {photoSuccess && (
  <div className="photo-success-msg">
   ✅ Profile photo updated successfully
  </div>
)}


  {editMode && profile.gender === "male" && (
    <label className="change-photo-btn">
      Change Photo
      <input type="file" hidden accept="image/*" onChange={handleEditImageUpload} />
    </label>
  )}
</div>



      {/* Status message */}
      <div className="profile-name-block">
        <h1>{profile.full_name}</h1>
        <p>{profile.gender} • {profile.age} years</p>

        <div className="profile-status-box">
          <div className="profile-status-title">Status</div>
          <div className="profile-status-msg">{statusMessage(profile)}</div>
          {profile.status === "rejected" && profile.rejection_reason && (
            <div className="profile-reject-reason">Reason: {profile.rejection_reason}</div>
          )}
        </div>
      </div>

      {/* VIEW MODE */}
      {!editMode ? (
        <div className="profile-sections">
          <div className="profile-section">
  <h3 className="profile-section-title">Profile Summary</h3>

  <div className="profile-grid">
    <Row label="Father" value={profile.father_name} />
    <Row label="Age" value={`${profile.age} years`} />
    <Row label="Education" value={profile.education} />
    <Row label="Occupation" value={profile.occupation} />
    <Row label="Residence" value={profile.current_residence} />
  

      <Row label="Paternal Grandfather" value={profile.paternal_grandfather} />
      <Row label="Maternal GrandFather" value={profile.maternal_grandfather} />
      <Row label="University" value={profile.university_name} />
      <Row label="School" value={profile.school_name} />
      <Row label="Contact Person" value={profile.contact_person} />
      <Row label="Contact Number" value={profile.contact_number} />
      <Row label="About" value={profile.description} multiline full />
    </div>
  </div>

{profile.description && (
  <div className="profile-section">
    <h3 className="profile-section-title">About</h3>
    <div className="profile-about">{profile.description}</div>
  </div>
)}

          <div className="profile-footer-note">
            Created: {new Date(profile.created_at).toDateString()}
          </div>

        <button
  type="button"
  className="primary-btn"
  onClick={() => setEditMode(true)}

>
  Edit Profile
</button>

         <button
           type="button"
           className="secondary-btn danger" onClick={() => setShowDeleteConfirm(true)}
 disabled={saving}>

            <Trash2 className="w-5 h-5" /> Delete Profile
          </button>
        </div>
       ) : (
  <div className="edit-page">

    {/* PHOTO CARD – MALE ONLY */}
   

    {/* EDIT FORM */}
    <div className="edit-form-card">

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          className="form-input"
          value={form.full_name || ""}
          onChange={(e) => setField("full_name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Father Name</label>
        <input
          className="form-input"
          value={form.father_name || ""}
          onChange={(e) => setField("father_name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Paternal Grandfather</label>
        <input
          className="form-input"
          value={form.paternal_grandfather || ""}
          onChange={(e) => setField("paternal_grandfather", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Maternal Grandfather</label>
        <input
          className="form-input"
          value={form.maternal_grandfather || ""}
          onChange={(e) => setField("maternal_grandfather", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Education</label>
        <input
          className="form-input"
          value={form.education || ""}
          onChange={(e) => setField("education", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">University</label>
        <input
          className="form-input"
          value={form.university_name || ""}
          onChange={(e) => setField("university_name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">School</label>
        <input
          className="form-input"
          value={form.school_name || ""}
          onChange={(e) => setField("school_name", e.target.value)}
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
          <option value="student">Student</option>
          <option value="business">Business</option>
          <option value="job">Job</option>
          <option value="GemStones Business">GemStones Business</option>
          <option value="Others">Others</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Current Residence</label>
        <input
          className="form-input"
          value={form.current_residence || ""}
          onChange={(e) => setField("current_residence", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contact Person</label>
        <input
          className="form-input"
          value={form.contact_person || ""}
          onChange={(e) => setField("contact_person", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contact Number</label>
        <input
          className="form-input"
          value={form.contact_number || ""}
          onChange={(e) => setField("contact_number", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">About</label>
        <textarea
          className="form-textarea"
          rows={4}
          value={form.description || ""}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>

      <button className="submit-btn" onClick={submitEdit} disabled={saving}>
        Save & Send for Approval
      </button>

      <button
        className="cancel-btn"
        onClick={() => setEditMode(false)}
        disabled={saving}
      >
        Cancel
      </button>
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
  <div className={`toast-msg ${toast.type}`}>
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
            setImagePreview(croppedImage);
            setShowCrop(false);
            await uploadEditedPhoto(blob);
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
