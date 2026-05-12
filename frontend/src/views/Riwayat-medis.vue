<script setup>
import { computed, onMounted, ref } from 'vue'
import { medisService, resepService } from '../services/medis'
import { obatService } from '../services/farmasi'

// State untuk tabel & filter
const rawRiwayat = ref([])
const search = ref('')
const tanggal = ref('')

// State untuk modal detail
const modal = ref(false)
const detail = ref({})

// State untuk modal edit
const editModal = ref(false)
const obatList = ref([])
const isSaving = ref(false)

const editForm = ref({
  id_rm: null,
  keluhan: '',
  diagnosa: '',
  tinggi_badan: '',
  berat_badan: '',
  tekanan_darah: ''
})
const editResep = ref([])

// Fetch Data
async function fetchRiwayat() {
  try {
    const data = await medisService.getAllMedis()
    rawRiwayat.value = data.map((item) => {
      // Format tanggal
      const tgl = new Date(item.tgl_periksa)
      const formattedDate = !isNaN(tgl.getTime())
        ? tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
        : item.tgl_periksa

      return {
        id: item.id_rm,
        tanggal: formattedDate,
        rawTanggal: tgl,
        pasien: item.nama_pasien || '-',
        dokter: item.nama_dokter || '-',
        keluhan: item.keluhan,
        diagnosa: item.diagnosa,
        tinggi_badan: item.tinggi_badan,
        berat_badan: item.berat_badan,
        tekanan_darah: item.tekanan_darah,
        status_tebus: item.status_tebus // bisa 'belum', 'sudah', 'batal', atau null/undefined
      }
    })
  }
  catch (error) {
    console.error(error)
  }
}

async function fetchObat() {
  try {
    const data = await obatService.getAllObat()
    obatList.value = data
  } catch (error) {
    console.error('Gagal memuat daftar obat', error)
  }
}

// Filtered Data
const riwayat = computed(() => {
  return rawRiwayat.value.filter((item) => {
    const matchName = item.pasien.toString().toLowerCase().includes(search.value.toLowerCase())

    let matchDate = true
    if (tanggal.value) {
      const filterDate = new Date(tanggal.value).toDateString()
      const itemDate = new Date(item.rawTanggal).toDateString()
      matchDate = filterDate === itemDate
    }

    return matchName && matchDate
  })
})

const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(riwayat.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return riwayat.value.slice(start, start + itemsPerPage)
})

function prevPage() {
  if (currentPage.value > 1)
    currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value)
    currentPage.value++
}

function lihatDetail(item) {
  detail.value = item
  modal.value = true
}

// ---------------- EDIT FUNCTIONALITY ---------------- //
async function bukaEdit(item) {
  editForm.value = {
    id_rm: item.id,
    keluhan: item.keluhan,
    diagnosa: item.diagnosa,
    tinggi_badan: item.tinggi_badan,
    berat_badan: item.berat_badan,
    tekanan_darah: item.tekanan_darah
  }
  
  editResep.value = []
  
  try {
    const currentResep = await resepService.getResepByRm(item.id)
    if (currentResep && currentResep.length > 0) {
      editResep.value = currentResep.map(r => ({
        obat: r.id_obat,
        jumlah: r.jumlah_obat,
        dosis: r.dosis
      }))
    }
  } catch (error) {
    console.error('Gagal mengambil data resep obat', error)
  }

  editModal.value = true
}

function tambahObat() {
  editResep.value.push({ obat: '', jumlah: '', dosis: '' })
}

function hapusObat(index) {
  editResep.value.splice(index, 1)
}

async function simpanEdit() {
  try {
    isSaving.value = true

    // 1. Update data rekam medis
    await medisService.updateMedis(editForm.value.id_rm, {
      keluhan: editForm.value.keluhan,
      diagnosa: editForm.value.diagnosa,
      tinggi_badan: Number(editForm.value.tinggi_badan) || 0,
      berat_badan: editForm.value.berat_badan ? Number(editForm.value.berat_badan) : null,
      tekanan_darah: editForm.value.tekanan_darah
    })

    // 2. Update data resep obat
    const daftar_obat = editResep.value
      .filter(item => item.obat && item.jumlah)
      .map(item => ({
        obat_id_obat: Number(item.obat),
        jumlah_obat: Number(item.jumlah),
        dosis: item.dosis
      }))

    await resepService.updateResepByRm(editForm.value.id_rm, { daftar_obat })

    alert('Perubahan berhasil disimpan!')
    editModal.value = false
    fetchRiwayat()
  } catch (error) {
    console.error('Gagal menyimpan perubahan', error)
    if (error.response) {
      if (error.response.status === 403) {
        alert('Gagal: Obat sudah ditebus, tidak bisa diubah lagi.')
      } else {
        alert(`Gagal: ${error.response.data.error || error.response.data.message || error.message}`)
      }
    } else {
      alert(`Terjadi kesalahan: ${error.message}`)
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchRiwayat()
  fetchObat()
})
</script>

<template>
  <div class="max-w-6xl mx-auto mt-10 p-4 relative">
    <div class="w-full bg-white p-6 border rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4 border-b pb-4">
        <h3 class="text-xl font-semibold text-gray-800">
          Riwayat Medis
        </h3>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <!-- FILTER -->
        <div class="flex flex-wrap items-center gap-4 mb-5">
          <div class="relative w-full sm:w-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Cari nama pasien..."
              class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 transition focus:border-indigo-600 focus:ring focus:ring-indigo-200 outline-none"
            >
          </div>

          <div class="relative w-full sm:w-auto">
            <input
              v-model="tanggal"
              type="date"
              class="w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg transition focus:border-indigo-600 focus:ring focus:ring-indigo-200 outline-none"
            >
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-5 py-4 font-semibold text-gray-600">No</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Tanggal</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Nama Pasien</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Nama Dokter</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Keluhan</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Diagnosa</th>
                <th class="px-5 py-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedData" :key="item.id" class="hover:bg-indigo-50/50 transition border-b border-gray-50 last:border-0">
                <td class="px-5 py-4 text-gray-600">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.tanggal }}
                </td>
                <td class="px-5 py-4 text-gray-800 font-medium">
                  {{ item.pasien }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.dokter }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.keluhan }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.diagnosa }}
                </td>
                <td class="px-5 py-4 align-middle">
                  <div class="flex justify-center gap-2">
                    <button class="bg-blue-500 text-white p-1.5 rounded hover:bg-blue-600 shadow-sm transition" title="Lihat Detail" @click="lihatDetail(item)">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>

                    <!-- Tombol Edit: hanya muncul jika status_tebus bukan 'sudah' -->
                    <button v-if="item.status_tebus !== 'sudah'" class="bg-orange-500 text-white p-1.5 rounded hover:bg-orange-600 shadow-sm transition" title="Edit Obat" @click="bukaEdit(item)">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="riwayat.length === 0">
                <td colspan="6" class="py-12 text-center text-gray-400">
                  Data tidak ditemukan...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex justify-between items-center mt-6">
          <p class="text-sm text-gray-600">
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, riwayat.length) }} dari {{ riwayat.length }} data
          </p>
          <UPagination v-model:page="currentPage" active-color="primary" :total="riwayat.length" />
        </div>
      </div>

      <!-- MODAL DETAIL -->
      <div v-if="modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
          <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
            <h2 class="text-xl font-bold text-gray-800">
              Detail Pemeriksaan
            </h2>
            <button class="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors" @click="modal = false">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-3 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div class="grid grid-cols-2 gap-2 border-b pb-2">
              <p class="text-gray-500">Nama Pasien</p>
              <p class="font-semibold text-right text-gray-800">{{ detail.pasien }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 border-b pb-2">
              <p class="text-gray-500">Nama Dokter</p>
              <p class="font-semibold text-right text-gray-800">{{ detail.dokter }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 border-b pb-2">
              <p class="text-gray-500">Tanggal</p>
              <p class="font-semibold text-right text-gray-800">{{ detail.tanggal }}</p>
            </div>
            <div class="grid grid-cols-3 gap-2 border-b pb-2 text-center">
              <div>
                <p class="text-gray-500 text-xs">Tinggi</p>
                <p class="font-semibold text-gray-800">{{ detail.tinggi_badan }} cm</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs">Berat</p>
                <p class="font-semibold text-gray-800">{{ detail.berat_badan }} kg</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs">Tensi</p>
                <p class="font-semibold text-gray-800">{{ detail.tekanan_darah }}</p>
              </div>
            </div>
            <div>
              <p class="text-gray-500 mb-1">Keluhan</p>
              <p class="text-gray-800 bg-white p-2 rounded border border-gray-200">{{ detail.keluhan }}</p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">Diagnosa</p>
              <p class="text-gray-800 bg-white p-2 rounded border border-gray-200">{{ detail.diagnosa }}</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors" @click="modal = false">
              Tutup
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL EDIT -->
      <div v-if="editModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div class="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
            <h2 class="text-xl font-bold text-gray-800">
              Edit Rekam Medis & Resep Obat
            </h2>
            <button class="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors" @click="editModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-6 overflow-y-auto space-y-6">
            
            <!-- Edit Pemeriksaan -->
            <div class="space-y-4">
              <h4 class="font-bold text-gray-700 text-lg border-b pb-2">Pemeriksaan</h4>
              
              <div class="flex flex-col">
                <label class="mb-1.5 font-semibold text-gray-700 text-sm">Keluhan</label>
                <textarea v-model="editForm.keluhan" rows="2" class="px-4 py-2.5 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none resize-none"></textarea>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="flex flex-col">
                  <label class="mb-1.5 font-semibold text-gray-700 text-sm">Tinggi Badan (cm)</label>
                  <input v-model="editForm.tinggi_badan" type="number" class="px-4 py-2.5 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none">
                </div>
                <div class="flex flex-col">
                  <label class="mb-1.5 font-semibold text-gray-700 text-sm">Berat Badan (kg)</label>
                  <input v-model="editForm.berat_badan" type="number" class="px-4 py-2.5 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none">
                </div>
                <div class="flex flex-col">
                  <label class="mb-1.5 font-semibold text-gray-700 text-sm">Tekanan Darah</label>
                  <input v-model="editForm.tekanan_darah" class="px-4 py-2.5 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none">
                </div>
              </div>

              <div class="flex flex-col">
                <label class="mb-1.5 font-semibold text-gray-700 text-sm">Diagnosa</label>
                <textarea v-model="editForm.diagnosa" rows="2" class="px-4 py-2.5 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none resize-none"></textarea>
              </div>
            </div>

            <!-- Edit Resep Obat -->
            <div class="space-y-4 pt-4 border-t border-gray-100">
              <div class="flex justify-between items-center">
                <h4 class="font-bold text-gray-700 text-lg">Resep Obat</h4>
                <button class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition shadow-sm border border-blue-200 text-sm" @click="tambahObat">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah Obat
                </button>
              </div>

              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="pb-2 font-semibold text-gray-600 text-sm">Obat</th>
                      <th class="pb-2 font-semibold text-gray-600 text-sm w-24">Jumlah</th>
                      <th class="pb-2 font-semibold text-gray-600 text-sm w-32">Dosis</th>
                      <th class="pb-2 font-semibold text-gray-600 text-sm text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in editResep" :key="index" class="border-b border-gray-100 last:border-0">
                      <td class="py-2 pr-2">
                        <select v-model="item.obat" class="px-3 py-2 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none text-sm bg-white">
                          <option disabled value="">Pilih Obat</option>
                          <option v-for="o in obatList" :key="o.id_obat" :value="o.id_obat">
                            {{ o.nama_obat }} (Stok: {{ o.stok }})
                          </option>
                        </select>
                      </td>
                      <td class="py-2 pr-2">
                        <input v-model="item.jumlah" type="number" min="1" class="px-3 py-2 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none text-sm">
                      </td>
                      <td class="py-2 pr-2">
                        <input v-model="item.dosis" placeholder="3x1" class="px-3 py-2 rounded-lg border border-gray-300 w-full focus:border-indigo-600 outline-none text-sm">
                      </td>
                      <td class="py-2 text-center">
                        <button class="bg-red-100 text-red-600 p-1.5 rounded hover:bg-red-200 transition" @click="hapusObat(index)" title="Hapus">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="editResep.length === 0">
                      <td colspan="4" class="text-center py-4 text-sm text-gray-500">
                        Tidak ada resep obat.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
            <button class="bg-white text-gray-600 border border-gray-300 px-5 py-2 rounded-lg font-semibold hover:bg-gray-50 transition" @click="editModal = false" :disabled="isSaving">
              Batal
            </button>
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2" @click="simpanEdit" :disabled="isSaving">
              <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
