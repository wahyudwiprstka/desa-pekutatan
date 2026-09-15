import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  const kategori = [
    {
      nama: "Pemerintahan Desa",
      slug: "pemerintahan-desa",
      deskripsi: "Kegiatan dan kebijakan penyelenggaraan pemerintahan desa.",
    },
    {
      nama: "Pembangunan",
      slug: "pembangunan",
      deskripsi: "Infrastruktur dan pembangunan fisik di wilayah desa.",
    },
    {
      nama: "Kesehatan",
      slug: "kesehatan",
      deskripsi:
        "Posyandu, jaminan kesehatan, dan program kesehatan masyarakat.",
    },
    {
      nama: "Pendidikan",
      slug: "pendidikan",
      deskripsi: "Kegiatan pendidikan formal, PAUD, dan pelatihan warga.",
    },
    {
      nama: "Sosial dan Kesejahteraan",
      slug: "sosial-dan-kesejahteraan",
      deskripsi:
        "Bantuan sosial, pemberdayaan keluarga, dan program kesejahteraan.",
    },
    {
      nama: "Ekonomi dan UMKM",
      slug: "ekonomi-dan-umkm",
      deskripsi: "BUMDesa, usaha rumah tangga, pertanian, dan perikanan.",
    },
    {
      nama: "Seni Budaya dan Keagamaan",
      slug: "seni-budaya-dan-keagamaan",
      deskripsi: "Kegiatan adat, upacara keagamaan, dan pelestarian budaya.",
    },
    {
      nama: "Lingkungan dan Kebersihan",
      slug: "lingkungan-dan-kebersihan",
      deskripsi:
        "Pengelolaan sampah, kebersihan lingkungan, dan mitigasi bencana.",
    },
  ];

  if (!email || !password) {
    throw new Error("EMAIL atau PASSWORD wajib diisi di .env");
  }

  // SEED ADMIN USER
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      nama: "Administrator Desa Pekutatan",
      role: "ADMIN",
    },
  });
  console.log("Seed admin berhasil!");

  // PROFIL DESA SEED
  await prisma.profilDesa.upsert({
    where: { id: 1 },
    update: {},
    create: {
      namaDesa: "Pekutatan",
      kodeWilayah: "51.01.03.2004",
      kecamatan: "Pekutatan",
      kabupaten: "Jembrana",
      provinsi: "Bali",
      alamatKantor:
        "Jl. Raya Denpasar - Gilimanuk, Pekutatan, Kec. Pekutatan, Kabupaten Jembrana, Bali 82262",
      telepon: "+62881038583095",
      email: "desapekutatan85@gmail.com",
      visi: "Mewujudkan Desa Pekutatan sebagai Kawasan sentra ekonomi terintegrasi pengembangan akomodasi wisata dengan daya dukung pertanian menuju desa sejahtera, mandiri dan berbudaya",
      misi: "",
      sejarah: "",
      luasWilayah: "16,62 km²",
      batasUtara: "Berbatasan dengan Desa Asahduren",
      batasTimur: "Berbatasan dengan Desa Pangyangan",
      batasBarat: "Berbatasan dengan Desa Pulukan",
      batasSelatan: "Berbatasan dengan Pantai dan Laut Bali",
      longitude: "114°50′21″",
      latitude: "8°25′16″",
      logoUrl: "image/logo.png",
    },
  });
  console.log("Seed profil desa berhasil!");

  // SEED KATEGORI BERITA
  for (const item of kategori) {
    await prisma.kategoriBerita.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
    console.log("Seed kategori berita " + item.nama + " berhasil");
  }
  console.log("Seluruh seed kategori berita berhasil!");

  const kategoriMap = new Map(
    (await prisma.kategoriBerita.findMany()).map((k) => [k.slug, k.id]),
  );

  const berita = [
    {
      judul: "Posyandu Balita Rutin Digelar di Empat Banjar",
      slug: "posyandu-balita-rutin-digelar-di-empat-banjar",
      ringkasan:
        "Kegiatan posyandu bulanan kembali dilaksanakan serentak dengan pemeriksaan tumbuh kembang dan pemberian vitamin A.",
      isi: "<p>Pemerintah Desa Pekutatan bersama kader PKK kembali menggelar kegiatan posyandu balita yang dilaksanakan serentak di seluruh banjar dinas.</p><p>Kegiatan meliputi penimbangan berat badan, pengukuran tinggi badan, serta pemberian <strong>vitamin A</strong> bagi balita usia 6 hingga 59 bulan.</p><p>Orang tua diimbau membawa buku KIA saat datang ke posyandu.</p>",
      kategoriSlug: "kesehatan",
      publishedAt: new Date("2026-08-12T02:00:00Z"),
      views: 142,
      tanggal: new Date("2026-08-12T02:00:00Z"),
    },
  ];

  for (const item of berita) {
    const { kategoriSlug, ...data } = item;
    const kategoriId = kategoriMap.get(kategoriSlug);
    if (!kategoriId) {
      throw new Error(`Kategori dengan slug ${kategoriSlug} tidak ditemukan`);
    }

    await prisma.berita.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        penulisId: admin.id,
        kategoriBeritaId: kategoriId,
        status: "PUBLISHED",
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
