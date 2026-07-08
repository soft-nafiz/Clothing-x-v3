/**
 * Bangladesh Divisions + Districts — hardcoded per spec.
 * Used by the checkout address picker. Delivery fees are looked up
 * from the `delivery_fees` table (admin-configurable).
 */
export interface DivisionData {
  name: string;
  districts: string[];
}

export const BANGLADESH_LOCATIONS: DivisionData[] = [
  {
    name: "Dhaka",
    districts: [
      "Dhaka", "Gazipur", "Narayanganj", "Manikganj", "Munshiganj",
      "Narsingdi", "Tangail", "Kishoreganj", "Faridpur", "Madaripur",
      "Gopalganj", "Rajbari", "Shariatpur",
    ],
  },
  {
    name: "Chattogram",
    districts: [
      "Chattogram", "Cox's Bazar", "Comilla", "Brahmanbaria", "Chandpur",
      "Noakhali", "Feni", "Lakshmipur", "Khagrachhari", "Rangamati", "Bandarban",
    ],
  },
  {
    name: "Rajshahi",
    districts: [
      "Rajshahi", "Bogura", "Pabna", "Natore", "Nawabganj",
      "Naogaon", "Joypurhat", "Sirajganj",
    ],
  },
  {
    name: "Khulna",
    districts: [
      "Khulna", "Jessore", "Satkhira", "Bagerhat", "Magura",
      "Jhenaidah", "Narail", "Chuadanga", "Kushtia", "Meherpur",
    ],
  },
  {
    name: "Barishal",
    districts: ["Barishal", "Patuakhali", "Barguna", "Jhalokati", "Pirojpur", "Bhola"],
  },
  {
    name: "Sylhet",
    districts: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  },
  {
    name: "Rangpur",
    districts: [
      "Rangpur", "Dinajpur", "Kurigram", "Lalmonirhat", "Nilphamari",
      "Gaibandha", "Thakurgaon", "Panchagarh",
    ],
  },
  {
    name: "Mymensingh",
    districts: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
  },
];

export const DIVISIONS = BANGLADESH_LOCATIONS.map((d) => d.name);

export function getDistricts(division: string): string[] {
  return BANGLADESH_LOCATIONS.find((d) => d.name === division)?.districts ?? [];
}

/** Default fee table (mirrors the SQL seed). Used when DB not yet set up. */
export const DEFAULT_DELIVERY_FEES: Record<string, number> = {
  "Dhaka|Dhaka": 60,
  "Dhaka|Gazipur": 80,
  "Dhaka|Narayanganj": 80,
  "Chattogram|Chattogram": 100,
  "Rajshahi|Rajshahi": 100,
  "Khulna|Khulna": 110,
  "Barishal|Barishal": 120,
  "Sylhet|Sylhet": 120,
  "Rangpur|Rangpur": 120,
  "Mymensingh|Mymensingh": 110,
};

export function defaultDeliveryFee(division: string, district: string): number {
  return DEFAULT_DELIVERY_FEES[`${division}|${district}`] ?? 120;
}
