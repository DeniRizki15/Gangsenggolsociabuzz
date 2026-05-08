if (!global._donations) {
  global._donations = [];
}

export const donations = global._donations;

export function clearDonations() {
  global._donations = [];
}
