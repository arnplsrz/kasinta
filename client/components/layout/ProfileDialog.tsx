"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI, API_BASE_URL } from "@/lib/api";
import { Camera, Save, User, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z
    .number()
    .min(18, "You must be at least 18 years old")
    .max(100, "Age must be less than 100"),
  gender: z.enum(["male", "female", "other"]),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  interestedIn: z.enum(["male", "female", "everyone"]),
  preferenceMinAge: z.number().min(18).max(100),
  preferenceMaxAge: z.number().min(18).max(100),
  preferenceDistance: z.number().min(1).max(1000),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      age: 18,
      gender: "male",
      bio: "",
      interestedIn: "everyone",
      preferenceMinAge: 18,
      preferenceMaxAge: 100,
      preferenceDistance: 50,
    },
  });

  const preferenceDistance = watch("preferenceDistance");

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        age: user.age,
        gender: user.gender as "male" | "female" | "other",
        bio: user.bio || "",
        interestedIn: user.interestedIn as "male" | "female" | "everyone",
        preferenceMinAge: user.preferenceMinAge,
        preferenceMaxAge: user.preferenceMaxAge,
        preferenceDistance: user.preferenceDistance,
      });
    }
  }, [user, reset]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    setUploading(true);

    try {
      await userAPI.uploadPhoto(file);
      await refreshUser();
      toast.success("Photo uploaded successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload photo"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await userAPI.deletePhoto();
      await refreshUser();
      toast.success("Photo deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete photo"
      );
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await userAPI.updateProfile({
        name: data.name,
        age: data.age,
        gender: data.gender,
        bio: data.bio || "",
        interestedIn: data.interestedIn,
        preferenceMinAge: data.preferenceMinAge,
        preferenceMaxAge: data.preferenceMaxAge,
        preferenceDistance: data.preferenceDistance,
      });
      await refreshUser();
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading">
            My Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
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
                  {user.profilePhoto && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="absolute -bottom-2 -left-2 bg-secondary-background text-foreground p-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button
                    type="button"
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
                {uploading && (
                  <p className="mt-2 text-sm font-base text-foreground/70">
                    Uploading...
                  </p>
                )}
              </div>
              {/* Bio */}
              <Field className="flex-1">
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <textarea
                  id="bio"
                  {...register("bio")}
                  rows={8}
                  className="h-24 sm:h-56 md:h-full w-full px-4 py-3 bg-background border-2 border-border rounded-base text-foreground focus:ring-2 focus:ring-main outline-none transition resize-none font-base"
                  placeholder="Tell us about yourself..."
                  disabled={isSubmitting}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </Field>
            </div>

            {/* Right Column */}
            <FieldGroup>
              {/* Name and Age Row */}
              <FieldGroup className="grid grid-cols-3 gap-4">
                <Field className="col-span-2">
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="age">Age</FieldLabel>
                  <Input
                    id="age"
                    type="number"
                    {...register("age", { valueAsNumber: true })}
                    min="18"
                    max="100"
                    disabled={isSubmitting}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.age.message}
                    </p>
                  )}
                </Field>
              </FieldGroup>

              {/* Gender and Interested In Row */}
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="gender">Gender</FieldLabel>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                        name="gender"
                      >
                        <SelectTrigger id="gender" className="w-full">
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
                    )}
                  />
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="interestedIn">Interested In</FieldLabel>
                  <Controller
                    name="interestedIn"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                        name="interestedIn"
                      >
                        <SelectTrigger id="interestedIn" className="w-full">
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
                    )}
                  />
                  {errors.interestedIn && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.interestedIn.message}
                    </p>
                  )}
                </Field>
              </FieldGroup>

              <h2 className="text-xl font-heading text-foreground mb-0">
                Preferences
              </h2>

              {/* Min Age and Max Age Row */}
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="preferenceMinAge">Min Age</FieldLabel>
                  <Input
                    id="preferenceMinAge"
                    type="number"
                    {...register("preferenceMinAge", { valueAsNumber: true })}
                    min="18"
                    max="100"
                    disabled={isSubmitting}
                  />
                  {errors.preferenceMinAge && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.preferenceMinAge.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="preferenceMaxAge">Max Age</FieldLabel>
                  <Input
                    id="preferenceMaxAge"
                    type="number"
                    {...register("preferenceMaxAge", { valueAsNumber: true })}
                    min="18"
                    max="100"
                    disabled={isSubmitting}
                  />
                  {errors.preferenceMaxAge && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.preferenceMaxAge.message}
                    </p>
                  )}
                </Field>
              </FieldGroup>

              {/* Max Distance Slider */}
              <Field>
                <div className="flex justify-between items-center mb-2">
                  <FieldLabel id="preferenceDistance">Max Distance</FieldLabel>
                  <span className="text-sm font-base text-foreground">
                    {preferenceDistance || 50} km
                  </span>
                </div>
                <Controller
                  name="preferenceDistance"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      aria-labelledby="preferenceDistance"
                      min={1}
                      max={1000}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      disabled={isSubmitting}
                      name="preferenceDistance"
                    />
                  )}
                />
                {errors.preferenceDistance && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.preferenceDistance.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="col-span-2 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
