import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "../ui/slider";
import { toast } from "sonner";

export default function FiltersSection() {
  const { user, refreshUser } = useAuth();
  const [filters, setFilters] = useState({
    interestedIn: user?.interestedIn || "everyone",
    minAge: user?.preferenceMinAge || 18,
    maxAge: user?.preferenceMaxAge || 100,
    distance: user?.preferenceDistance || 50,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFilters({
        interestedIn: user.interestedIn,
        minAge: user.preferenceMinAge,
        maxAge: user.preferenceMaxAge,
        distance: user.preferenceDistance,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({
        interestedIn: filters.interestedIn,
        preferenceMinAge: filters.minAge,
        preferenceMaxAge: filters.maxAge,
        preferenceDistance: filters.distance,
      });
      await refreshUser();
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update preferences", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading">Preferences</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-base mb-2">Interested In</label>
          <Select
            value={filters.interestedIn}
            onValueChange={(value) =>
              setFilters({ ...filters, interestedIn: value })
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

        <div>
          <label className="block text-sm font-base mb-2">
            Age Range: {filters.minAge}-{filters.maxAge}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minAge}
              onChange={(e) =>
                setFilters({ ...filters, minAge: parseInt(e.target.value) })
              }
              min="18"
              max="100"
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-base text-foreground"
            />
            <input
              type="number"
              value={filters.maxAge}
              onChange={(e) =>
                setFilters({ ...filters, maxAge: parseInt(e.target.value) })
              }
              min="18"
              max="100"
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-base text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-base mb-2">
            Max Distance: {filters.distance} km
          </label>
          {/* <input
            type="range"
            value={filters.distance}
            onChange={(e) =>
              setFilters({ ...filters, distance: parseInt(e.target.value) })
            }
            min="1"
            max="1000"
            className="w-full"
          /> */}
          <Slider
            className="w-full"
            defaultValue={[filters.distance]}
            onValueChange={(value) =>
              setFilters({ ...filters, distance: value[0] })
            }
            min={1}
            max={1000}
            step={1}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-main border-2 border-border rounded-base px-4 py-2 font-base text-main-foreground shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </>
  );
}
