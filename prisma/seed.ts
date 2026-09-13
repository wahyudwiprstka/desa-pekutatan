import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL!})
const prisma = new PrismaClient({adapter})

async function main(){
    // USER SEED
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    const kategori = [
        {
            nama: "Pemerintahan Desa",
            slug: "pemerintahan-desa",
            deskripsi: "Kegiatan dan kebijakan penyelenggaraan pemerintahan desa."
        },
        {
            nama: "Pembangunan",
            slug: "pembangunan",
            deskripsi: "Infrastruktur dan pembangunan fisik di wilayah desa."
        },
        {
            nama: "Kesehatan",
            slug: "kesehatan",
            deskripsi: "Posyandu, jaminan kesehatan, dan program kesehatan masyarakat."
        },
        {
            nama: "Pendidikan",
            slug: "pendidikan",
            deskripsi: "Kegiatan pendidikan formal, PAUD, dan pelatihan warga."
        },
        {
            nama: "Sosial dan Kesejahteraan",
            slug: "sosial-dan-kesejahteraan",
            deskripsi: "Bantuan sosial, pemberdayaan keluarga, dan program kesejahteraan."
        },
        {
            nama: "Ekonomi dan UMKM",
            slug: "ekonomi-dan-umkm",
            deskripsi: "BUMDesa, usaha rumah tangga, pertanian, dan perikanan."
        },
        {
            nama: "Seni Budaya dan Keagamaan",
            slug: "seni-budaya-dan-keagamaan",
            deskripsi: "Kegiatan adat, upacara keagamaan, dan pelestarian budaya."
        },
        {
            nama: "Lingkungan dan Kebersihan",
            slug: "lingkungan-dan-kebersihan",
            deskripsi: "Pengelolaan sampah, kebersihan lingkungan, dan mitigasi bencana."
        }
    ]

    if(!email || !password){
        throw new Error("EMAIL atau PASSWORD wajib diisi di .env")
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.upsert({
        where: {email},
        update: {},
        create: {
            email,
            passwordHash,
            nama: "Administrator Desa Pekutatan",
            role: 'ADMIN',
        }
    })
    console.log("Seed admin berhasil!")


    // PROFIL DESA SEED
    await prisma.profilDesa.upsert({
        where: {id: 1},
        update: {},
        create: {
            namaDesa: "Pekutatan",
            kodeWilayah: "51.01.03.2004",
            kecamatan: "Pekutatan",
            kabupaten: "Jembrana",
            provinsi: "Bali",
            alamatKantor: "Jl. Raya Denpasar - Gilimanuk, Pekutatan, Kec. Pekutatan, Kabupaten Jembrana, Bali 82262",
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
            logoUrl: "image/logo.png"
        }
    })
    console.log("Seed profil desa berhasil!")

    for (const item of kategori){
        await prisma.kategoriBerita.upsert({
            where: {slug: item.slug},
            update: {},
            create: item
        })
        console.log("Seed kategori berita " + item.nama + " berhasil")
    }
    console.log("Seluruh seed kategori berita berhasil!")
}