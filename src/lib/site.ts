// Business details shown across the site. Edit these in one place.
export const site = {
  name: "7S Builder Depot",
  tagline: "Build it right, from the floor up.",
  phone: "(203) 443-6495",
  phoneHref: "tel:+12034436495",
  email: "7sbuilderdepot@gmail.com",
  address: {
    line1: "1001 NW 2nd St, Ste 200C",
    city: "Kerens",
    state: "TX",
    zip: "75144",
  },
  // Sample hours — replace with your real hours.
  hours: "Mon–Sat 7am–6pm",
  deliveryFee: 75,
  taxRate: 0.0825,
} as const;

export const fullAddress = `${site.address.line1}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;

export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
