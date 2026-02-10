import { useState } from 'react';
import { ChevronLeft, Upload, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDeviceId } from "../utils/device";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";

<button
  onClick={() => onNavigate("home")}
  className="p-2 bg-gray-100 rounded"
>
  ← Back
</button>

interface FormData {
  gender: 'male' | 'female' | '';
  full_name: string;
  dob: string;
  father_name: string;
  paternal_grandfather: string;
  maternal_grandfather: string;
  occupation: string;
  current_residence: string;
  contact_person: string;
  contact_number: string;
  education: string;
  university_name: string;
  school_name: string;
  description: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

const FEMALE_AVATAR_URL = 'https://kmnfhmhitymwxfotqsdz.supabase.co/storage/v1/object/public/profile-photos/final%20avatar.png';

export default function AddProfile({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [formData, setFormData] = useState<FormData>({
    gender: '',
    full_name: '',
    dob: '',
    father_name: '',
    paternal_grandfather: '',
    maternal_grandfather: '',
    occupation: '',
    current_residence: '',
    contact_person: '',
    contact_number: '',
    education: '',
    university_name: '',
    school_name: '',
    description: '',
  });
 const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
const [showCrop, setShowCrop] = useState(false);
const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [wordCount, setWordCount] = useState(0);

  function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
  });
}
async function optimizeImage(file: File) {
  const options = {
    maxSizeMB: 1,              // keeps quality high
    maxWidthOrHeight: 1400,    // good for profiles
    useWebWorker: true,
    initialQuality: 0.9,
  };

  return await imageCompression(file, options);
}


async function getCroppedImg(imageSrc: string, crop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx?.drawImage(
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


  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };


  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'description') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
    }
  };

  const handleGenderChange = (value: 'male' | 'female') => {
    setFormData(prev => ({ ...prev, gender: value }));
    setImageFile(null);
    setImagePreview('');
    setErrors(prev => ({ ...prev, gender: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

   setImageFile(file);
   setImagePreview(URL.createObjectURL(file)); // show preview
  setShowCrop(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.gender) newErrors.gender = 'Please select a gender';
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.father_name.trim()) newErrors.father_name = 'Father\'s name is required';
    if (!formData.paternal_grandfather.trim()) newErrors.paternal_grandfather = 'Paternal grandfather name is required';
    if (!formData.maternal_grandfather.trim()) newErrors.maternal_grandfather = 'Maternal grandfather name is required';
    if (!formData.occupation) newErrors.occupation = 'Occupation is required';
    if (formData.description && wordCount > 50) newErrors.description = 'Description cannot exceed 50 words';

    if (formData.gender === 'male' && !imageFile) {
      newErrors.profile_pic = 'Male users must upload a profile picture';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file: Blob): Promise<string> => {
  const generateUUID = () => {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).substring(2, 12);
  };

  const fileName = `${generateUUID()}.jpg`; // fixed extension
  const filePath = fileName; // 🔥 IMPORTANT: no folder name here

  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, { contentType: 'image/jpeg' });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors above', 'error');
      return;
    }

    setLoading(true);

    try {
      const age = calculateAge(formData.dob);

      if (formData.gender === 'female' && age < 14) {
  showToast("Girl age must be at least 14 years", "error");
  setLoading(false);
  return;
}

if (formData.gender === 'male' && age < 16) {
  showToast("Boy age must be at least 16 years", "error");
  setLoading(false);
  return;
}


      let profile_pic = '';

     if (formData.gender === 'male' && croppedBlob) {
  // Convert blob to File
  const fileFromBlob = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
  
  // Optimize image
  const optimizedFile = await optimizeImage(fileFromBlob);

  // Convert back to blob
  const optimizedBlob = await fetch(URL.createObjectURL(optimizedFile)).then(r => r.blob());

  // Upload optimized image
  profile_pic = await uploadImage(optimizedBlob);
}

 else if (formData.gender === 'female') {
        profile_pic = FEMALE_AVATAR_URL;
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            gender: formData.gender,
            full_name: formData.full_name.trim(),
            device_id: getDeviceId(),
            dob: formData.dob,
            age,
            father_name: formData.father_name.trim(),
            paternal_grandfather: formData.paternal_grandfather.trim(),
            maternal_grandfather: formData.maternal_grandfather.trim(),
            occupation: formData.occupation,
            education: formData.education || null,
            university_name: formData.university_name || null,
            school_name: formData.school_name || null,
            current_residence: formData.current_residence.trim(),
            description: formData.description.trim() || null,
            contact_person: formData.contact_person.trim(),
            contact_number: formData.contact_number.trim(),
            profile_pic,
            approved: false,
            status: 'pending',
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      .select();

      if (error) {
        throw error;
      }
      if (data?.length) {
  localStorage.setItem("mangni_profile_id", data[0].id);
}

      showToast('Profile submitted — wait for admin approval.', 'success');
      setTimeout(() => {
        setFormData({
          gender: '',
          full_name: '',
          dob: '',
          father_name: '',
          paternal_grandfather: '',
          maternal_grandfather: '',
          occupation: '',
          current_residence: '',
          contact_person: '',
          contact_number: '',
          education: '',
          university_name: '',
          school_name: '',
          description: '',
        });
        setImageFile(null);
        setImagePreview('');
        setWordCount(0);
        onNavigate('home');
      }, 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Profile</h1>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}




      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile For</h2>
<select
  name="gender"
  value={formData.gender}
  onChange={(e) => handleGenderChange(e.target.value as 'male' | 'female')}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  <option value="">Select</option>
  <option value="male">Boy</option>
  <option value="female">Girl</option>
</select>
{errors.gender && <p className="text-red-500 text-sm mt-2">{errors.gender}</p>}
        </div>

        {formData.gender === 'male' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Picture</h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload image</p>
                  <p className="text-gray-400 text-sm">Max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            {errors.profile_pic && <p className="text-red-500 text-sm mt-2">{errors.profile_pic}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter full name"
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div>

    

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter father's name"
            />
            {errors.father_name && <p className="text-red-500 text-sm mt-1">{errors.father_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paternal Grandfather *</label>
            <input
              type="text"
              name="paternal_grandfather"
              value={formData.paternal_grandfather}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter name"
            />
            {errors.paternal_grandfather && <p className="text-red-500 text-sm mt-1">{errors.paternal_grandfather}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maternal Grandfather *</label>
            <input
              type="text"
              name="maternal_grandfather"
              value={formData.maternal_grandfather}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter name"
            />
            {errors.maternal_grandfather && <p className="text-red-500 text-sm mt-1">{errors.maternal_grandfather}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation *</label>
            <select
  name="occupation"
  value={formData.occupation}
  onChange={handleInputChange}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  required
>
  <option value="">Select occupation</option>
  <option value="Student">Student</option>
  <option value="Business">Business</option>
  <option value="Job">Job</option>
  <option value="Gemstones Business">GemStones Business</option>
  <option value="Other">Other</option>
</select>

            {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ongoing/Completed Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="sslc,12th,mbbs,BE,BA etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University Name (if any)  </label>
            <input
              type="text"
              name="university_name"
              value={formData.university_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter university name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
            <input
              type="text"
              name="school_name"
              value={formData.school_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Residence </label>
            <input
              type="text"
              name="current_residence"
              value={formData.current_residence}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter current residence"
            />
            {errors.current_residence && <p className="text-red-500 text-sm mt-1">{errors.current_residence}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person </label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter contact person name"
            />
            {errors.contact_person && <p className="text-red-500 text-sm mt-1">{errors.contact_person}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Enter contact number"
            />
            {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description ({wordCount}/50 words)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none h-24"
            placeholder="Tell us about yourself (max 50 words)"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-amber-100 hover:bg-amber-50 text-amber-900 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Profile'}
          </button>
        </div>

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
          onCropComplete={(area, pixels) => setCroppedAreaPixels(pixels)}
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
          }}
          className="px-4 py-2 bg-amber-500 text-white rounded"
        >
          Done
        </button>
      </div>
    </div>
  </div>
)}

      </form>
    </div>
   
  );
}
