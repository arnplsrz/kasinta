"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { userAPI } from "@/lib/api";
import { KasintaLogo } from "@/components/ui/kasinta-logo";

const profileSchema = z.object({
  age: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "Age is required" : "Age must be a number",
    })
    .min(18, "You must be at least 18 years old")
    .max(100, "Age must be less than 100"),
  gender: z.enum(["male", "female", "other"], {
    message: "Please select a gender",
  }),
  interestedIn: z.enum(["male", "female", "everyone"], {
    message: "Please select your preference",
  }),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileCompletePage() {
  const [loading, setLoading] = useState(false);
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Redirect if profile is already complete
  useEffect(() => {
    if (user && user.age && user.gender) {
      router.push("/");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: "male",
      interestedIn: "everyone",
      bio: "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      await userAPI.updateProfile({
        age: data.age,
        gender: data.gender,
        interestedIn: data.interestedIn,
        bio: data.bio || undefined,
      });

      // Refresh user data
      await refreshUser();

      toast.success("Profile completed successfully!");
      router.push("/");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-base border-2 border-border bg-secondary-background p-8 shadow-shadow text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-base border-4 border-border border-t-main"></div>
          <p className="font-base text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-3">
      <div className="col-span-2 flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <KasintaLogo size="xl" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center mb-6">
                  <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    We need a few more details to get you started
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="age">Age</FieldLabel>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    disabled={loading}
                    {...register("age", { valueAsNumber: true })}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.age.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="gender">Gender</FieldLabel>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <SelectTrigger id="gender">
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <SelectTrigger id="interestedIn">
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

                <Field>
                  <FieldLabel htmlFor="bio">Bio (Optional)</FieldLabel>
                  <textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    disabled={loading}
                    {...register("bio")}
                    className="flex min-h-20 w-full rounded-base border-2 border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.bio.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Spinner /> : "Continue"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div
        className="bg-muted relative hidden lg:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='32' viewBox='0 0 48 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='currentColor' fill-opacity='0.4'%3E%3Cpath d='M27 32c0-3.314 2.686-6 6-6 5.523 0 10-4.477 10-10S38.523 6 33 6c-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 6.627 0 12 5.373 12 12s-5.373 12-12 12c-2.21 0-4 1.79-4 4h-2zm-6 0c0-3.314-2.686-6-6-6-5.523 0-10-4.477-10-10S9.477 6 15 6c3.314 0 6-2.686 6-6h-2c0 2.21-1.79 4-4 4C8.373 4 3 9.373 3 16s5.373 12 12 12c2.21 0 4 1.79 4 4h2z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
    </div>
  );
}
