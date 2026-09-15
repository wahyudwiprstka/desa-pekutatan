import { prisma } from "@/lib/prisma";

export default async function ProfilPage() {
  const profil = await prisma.profilDesa.findFirst();

  if (!profil) {
    return <p>Data profil desa belum tersedia.</p>;
  }

  return (
    <main>
      <h1>{profil.namaDesa}</h1>
      <p>
        Kecamatan {profil.kecamatan}, Kabupaten {profil.kabupaten}
      </p>

      <h2>Visi</h2>
      <p>{profil.visi}</p>

      <h2>Misi</h2>
      <p>{profil.misi}</p>
    </main>
  );
}
