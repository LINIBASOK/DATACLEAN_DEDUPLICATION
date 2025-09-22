
 
const COUNTRY_CODES = {
  France: "+33",
  Germany: "+49",
  UK: "+44",
  Spain: "+34",
  Italy: "+39",
};

function normalizePhone(phone, country) {
  if (!phone) return "";

  let digits = phone.replace(/\D/g, "");

 
  if (/^0[67]/.test(digits)) {
    return "+33" + digits.slice(1);
  }

  if (digits.startsWith("0033")) return "+33" + digits.slice(4);
  if (digits.startsWith("0034")) return "+34" + digits.slice(4);
  if (digits.startsWith("0039")) return "+39" + digits.slice(4);
  if (digits.startsWith("0044")) return "+44" + digits.slice(4);
  if (digits.startsWith("0049")) return "+49" + digits.slice(4);

  if (digits.startsWith("33")) return "+33" + digits.slice(2);
  if (digits.startsWith("34")) return "+34" + digits.slice(2);
  if (digits.startsWith("39")) return "+39" + digits.slice(2);
  if (digits.startsWith("44")) return "+44" + digits.slice(2);
  if (digits.startsWith("49")) return "+49" + digits.slice(2);

  if (country && COUNTRY_CODES[country]) {
    return COUNTRY_CODES[country] + digits;
  }

  return "+" + digits;
}

function properCase(str = "") {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (x) => x.toUpperCase())
    .trim();
}

function cleanEmail(email = "") {
  email = email.trim();
  return email.includes("@") ? email : "";
}

function splitFullName(name = "") {
  const parts = name.trim().split(" ");
  return {
    FirstName: properCase(parts[0]),
    LastName: properCase(parts.slice(1).join(" ")),
  };
}

function splitFullAddress(addr = "") {
  const parts = addr.split(",");
  const street = parts[0]?.trim() || "";
  const zipAndCity = parts[1]?.trim().split(" ") || [];

  const ZipCode = zipAndCity[0] || "";
  const City = properCase(zipAndCity.slice(1).join(" "));

  return { Street: street, ZipCode, City };
}

function normalizeRecord(record) {
  let {
    FirstName,
    LastName,
    FullName,
    Street,
    FullAddress,
    ZipCode,
    City,
    Country,
    Email,
    Phone,
  } = record;

  if (!FirstName && FullName) {
    const name = splitFullName(FullName);
    FirstName = name.FirstName;
    LastName = name.LastName;
  }

  if (!Street && FullAddress) {
    const address = splitFullAddress(FullAddress);
    Street = address.Street;
    ZipCode = address.ZipCode;
    City = address.City;
  }

  return {
    FirstName: properCase(FirstName),
    LastName: properCase(LastName),
    Street: Street?.trim(),
    ZipCode: ZipCode?.trim(),
    City: properCase(City),
    Country: properCase(Country),
    Email: cleanEmail(Email),
    Phone: normalizePhone(Phone, Country),
  };
}

function deduplicate(records) {
  const unique = new Map();

  records.forEach((rec) => {
    const key1 =
      `${rec.FirstName}|${rec.LastName}|${rec.Street}|${rec.ZipCode}|${rec.City}`.toLowerCase();
    const key2 = rec.Email.toLowerCase();
    const key3 = rec.Phone;

    const existingKey = [...unique.keys()].find(
      (k) => k === key1 || k === key2 || k === key3
    );

    if (!existingKey) {
      unique.set(key1, rec);
    }
  });

  return Array.from(unique.values());
}

export function cleanAndMergeData(file1, file2, file3) {
  const allRaw = [...file1, ...file2, ...file3];
  const cleaned = allRaw.map(normalizeRecord);
  const deduped = deduplicate(cleaned);
  return deduped;
}
