"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI, API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, Save, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    bio: "",
    interestedIn: "everyone",
    preferenceMinAge: "18",
    preferenceMaxAge: "100",
    preferenceDistance: "50",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const newFormData = {
        name: user.name,
        age: user.age.toString(),
        gender: user.gender,
        bio: user.bio || "",
        interestedIn: user.interestedIn,
        preferenceMinAge: user.preferenceMinAge.toString(),
        preferenceMaxAge: user.preferenceMaxAge.toString(),
        preferenceDistance: user.preferenceDistance.toString(),
      };
      setFormData(newFormData);
    }
  }, [user, loading, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setUploading(true);
    setError("");

    try {
      await userAPI.uploadPhoto(file);
      await refreshUser();
      setMessage("Photo uploaded successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Are you sure you want to delete your profile photo?")) return;

    try {
      await userAPI.deletePhoto();
      await refreshUser();
      setMessage("Photo deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await userAPI.updateProfile({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        interestedIn: formData.interestedIn,
        preferenceMinAge: parseInt(formData.preferenceMinAge),
        preferenceMaxAge: parseInt(formData.preferenceMaxAge),
        preferenceDistance: parseFloat(formData.preferenceDistance),
      });
      await refreshUser();
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="bg-secondary-background border-2 border-border rounded-base shadow-shadow p-8">
            <div className="flex flex-col items-center mb-8">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-secondary-background rounded-base shadow-shadow border-2 border-border p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-heading text-foreground">
              My Profile
            </h1>
            <Link href={"/"}>
              <Button variant="neutral" className="flex items-center gap-2">
                <ChevronLeft size={20} />
                Go Back
              </Button>
            </Link>
          </div>

          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-base overflow-hidden bg-main/10 flex items-center justify-center border-2 border-border shadow-shadow">
                {user.profilePhoto ? (
                  <img
                    src={`${API_BASE_URL}${user.profilePhoto}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-foreground/30" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 bg-main text-main-foreground p-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition disabled:opacity-50"
              >
                <Camera size={20} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {user.profilePhoto && (
              <button
                onClick={handleDeletePhoto}
                className="mt-4 text-sm font-base text-foreground hover:underline"
              >
                Delete photo
              </button>
            )}
            {uploading && (
              <p className="mt-2 text-sm font-base text-foreground/70">
                Uploading...
              </p>
            )}
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 bg-chart-4 border-2 border-border text-main-foreground px-4 py-3 rounded-base font-base">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-chart-2 border-2 border-border text-main-foreground px-4 py-3 rounded-base font-base">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="18"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestedIn">Interested In</Label>
                <Select
                  value={formData.interestedIn}
                  onValueChange={(value) =>
                    setFormData({ ...formData, interestedIn: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="male">Men</SelectItem>
                      <SelectItem value="female">Women</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-base text-foreground focus:ring-2 focus:ring-main outline-none transition resize-none font-base"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="border-t-2 border-border pt-6">
              <h2 className="text-xl font-heading text-foreground mb-4">
                Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferenceMinAge">Min Age</Label>
                  <Input
                    id="preferenceMinAge"
                    name="preferenceMinAge"
                    type="number"
                    value={formData.preferenceMinAge}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferenceMaxAge">Max Age</Label>
                  <Input
                    id="preferenceMaxAge"
                    name="preferenceMaxAge"
                    type="number"
                    value={formData.preferenceMaxAge}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="preferenceDistance">Max Distance (km)</Label>
                  <Input
                    id="preferenceDistance"
                    name="preferenceDistance"
                    type="number"
                    value={formData.preferenceDistance}
                    onChange={handleChange}
                    required
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
