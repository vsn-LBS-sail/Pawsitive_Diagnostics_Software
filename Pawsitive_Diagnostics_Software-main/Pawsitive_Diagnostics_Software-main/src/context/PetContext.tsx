import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type PetAvatar = {
  furColor: string;
  earStyle: string;
  eyeStyle: string;
  collarColor: string;
};

export type AvatarStatus =
  | "default" | "customised" | "pending" | "ready";

export type DogAge = { years: number; months: number };
export type DogWeight = { value: number | null; unit: "kg" | "lbs" };
export type VaccinationStatus = "yes" | "partial" | "unsure" | null;

export type PetProfile = {
  name: string;
  breed: string;
  breedEn: string;
  breedJp: string;
  age: number | null;
  weight: number | null;
  gender: "male" | "female" | null;
  vaccinated: boolean;
  photoUrl: string | null;
  avatar: PetAvatar;
  ownerName: string;
  ownerAge: number | null;
  ownerGender: "Male" | "Female" | "Prefer not to say" | null;
  ownerContact: string;
  prefecture: string;
  // Avatar onboarding
  dogPhotoUrl: string | null;
  ownerPhotoUrl: string | null;
  avatarSvgUrl: string | null;
  selectedPose: number | null;
  avatarStatus: AvatarStatus;
  path: "A" | "B" | null;
  // Step 4 — Dog Details
  dogAge: DogAge;
  dogWeight: DogWeight;
  vaccinationStatus: VaccinationStatus;
  healthConditions: string;
  vetName: string;
  collarId: string;
  isStrayMonitoring: boolean;
  justCompletedOnboarding: boolean;
};

export const DEFAULT_PET: PetProfile = {
  name: "",
  breed: "shiba",
  breedEn: "Shiba Inu",
  breedJp: "柴犬",
  age: null,
  weight: null,
  gender: null,
  vaccinated: false,
  photoUrl: null,
  avatar: {
    furColor: "#C4813A",
    earStyle: "upright",
    eyeStyle: "round",
    collarColor: "#E8829A",
  },
  ownerName: "",
  ownerAge: null,
  ownerGender: null,
  ownerContact: "",
  prefecture: "東京都",
  dogPhotoUrl: null,
  ownerPhotoUrl: null,
  avatarSvgUrl: null,
  selectedPose: null,
  avatarStatus: "default",
  path: null,
  dogAge: { years: 0, months: 0 },
  dogWeight: { value: null, unit: "kg" },
  vaccinationStatus: null,
  healthConditions: "",
  vetName: "",
  collarId: "",
  isStrayMonitoring: false,
  justCompletedOnboarding: false,
};

type Ctx = {
  pet: PetProfile;
  setPet: (p: PetProfile) => void;
  updatePet: (fields: Partial<PetProfile>) => void;
  updateAvatar: (fields: Partial<PetAvatar>) => void;
};

const KEY = "wancare_pet_profile";

const PetContext = createContext<Ctx>({
  pet: DEFAULT_PET,
  setPet: () => {},
  updatePet: () => {},
  updateAvatar: () => {},
});

export function PetProvider({ children }: { children: ReactNode }) {
  const [pet, setPetState] = useState<PetProfile>(DEFAULT_PET);
  const hydrated = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPetState({ ...DEFAULT_PET, ...parsed, avatar: { ...DEFAULT_PET.avatar, ...(parsed.avatar ?? {}) } });
      }
    } catch {}
    hydrated.current = true;
  }, []);

  const persist = (next: PetProfile) => {
    setPetState(next);
    if (typeof window !== "undefined") {
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    }
  };

  const setPet = (p: PetProfile) => persist(p);
  const updatePet = (fields: Partial<PetProfile>) => persist({ ...pet, ...fields });
  const updateAvatar = (fields: Partial<PetAvatar>) =>
    persist({ ...pet, avatar: { ...pet.avatar, ...fields } });

  return (
    <PetContext.Provider value={{ pet, setPet, updatePet, updateAvatar }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  return useContext(PetContext);
}

export function displayName(pet: PetProfile, fallback = "My Dog") {
  return pet.name?.trim() ? pet.name : fallback;
}
