const BASE = "https://api.airtable.com/v0/appRxbCRDDzIgGSTL";

function headers() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function airtableCreate(table: string, fields: Record<string, string>) {
  const res = await fetch(`${BASE}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable create error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function airtablePatch(table: string, recordId: string, fields: Record<string, string>) {
  const res = await fetch(`${BASE}/${encodeURIComponent(table)}/${recordId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable patch error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function airtableFindByEmail(table: string, email: string): Promise<string | null> {
  const formula = `LOWER({Email})=LOWER('${email.replace(/'/g, "\\'")}')`;
  const res = await fetch(
    `${BASE}/${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(formula)}`,
    { headers: headers() }
  );
  if (!res.ok) return null;
  const data = await res.json() as { records?: { id: string }[] };
  return data.records?.[0]?.id ?? null;
}

export function today() {
  return new Date().toISOString().split("T")[0];
}
