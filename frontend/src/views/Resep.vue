<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { type DetailResep, detailresepService, obatService } from '../services/farmasi'

// STATE
const daftarDetail = ref<DetailResep[]>([])
const search = ref('')
const showConfirmDialog = ref(false)
const batalId = ref<number | undefined>(undefined) // id_resep (resep_obat_id_resep)
const loadingToggle = ref<number | null>(null)      // id_resep yang sedang di-toggle

// ================= GET DATA =================
async function fetchDetail() {
  try {
    const data = await detailresepService.getAllDetailResep()
    daftarDetail.value = data
  }
  catch (error: any) {
    console.error(error.message)
  }
}

// ================= FILTER =================
// Backend sudah memfilter 'batal', tapi filter search tetap di sini
const filteredResep = computed(() => {
  return daftarDetail.value.filter((item) => {
    const q = search.value.toLowerCase()
    return (
      item.nama_obat.toLowerCase().includes(q)
      || (item.no_resep || '').toLowerCase().includes(q)
    )
  })
})

// ================= PAGINATION =================
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(filteredResep.value.length / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredResep.value.slice(start, start + itemsPerPage)
})

// ================= TOGGLE STATUS TEBUS =================
async function toggleStatusTebus(item: DetailResep) {
  const idResep = item.resep_obat_id_resep
  const statusBaru: 'belum' | 'sudah' = item.status_tebus === 'sudah' ? 'belum' : 'sudah'

  loadingToggle.value = idResep
  try {
    await detailresepService.updateStatusTebus(idResep, statusBaru)
    // Update lokal tanpa re-fetch
    daftarDetail.value = daftarDetail.value.map(d =>
      d.resep_obat_id_resep === idResep ? { ...d, status_tebus: statusBaru } : d
    )
  }
  catch (error: any) {
    console.error('Gagal update status:', error.message)
  }
  finally {
    loadingToggle.value = null
  }
}

// ================= BATAL (SOFT DELETE) =================
function openConfirmBatal(idResep: number | undefined) {
  if (!idResep) return
  batalId.value = idResep
  showConfirmDialog.value = true
}

function cancelBatal() {
  showConfirmDialog.value = false
  batalId.value = undefined
}

async function batalkanResep() {
  if (!batalId.value) return
  try {
    await detailresepService.batalResep(batalId.value)
    showConfirmDialog.value = false
    batalId.value = undefined
    fetchDetail()
  }
  catch (error: any) {
    console.error(error.message)
    showConfirmDialog.value = false
  }
}

// ================= INIT =================
onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="max-w-6xl mx-auto mt-10 p-4 relative">
    <div class="w-full bg-white p-6 border rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4 border-b pb-4">
        <h3 class="text-xl font-semibold text-gray-800">
          Daftar Resep
        </h3>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <!-- Search Bar -->
        <div class="mb-5">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Cari no resep atau nama obat..."
              class="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 transition focus:border-indigo-600 focus:ring focus:ring-indigo-200 outline-none"
            >
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-5 py-4 font-semibold text-gray-600">No</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Kode Resep</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Nama Pasien</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Nama Obat</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Jumlah</th>
                <th class="px-5 py-4 font-semibold text-gray-600">Dosis</th>
                <th class="px-5 py-4 font-semibold text-gray-600 text-center">Status</th>
                <th class="px-5 py-4 font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in paginatedData"
                :key="item.id_detail"
                class="hover:bg-indigo-50/50 transition border-b border-gray-50 last:border-0"
              >
                <td class="px-5 py-4 text-gray-600">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-5 py-4 text-gray-800 font-semibold tracking-wide">
                  {{ item.no_resep || '-' }}
                </td>
                <td class="px-5 py-4 text-gray-800 font-medium">
                  {{ item.nama_pasien }}
                </td>
                <td class="px-5 py-4 text-gray-800 font-medium">
                  {{ item.nama_obat }}
                </td>
                <td class="px-5 py-4 text-gray-600">
                  <span class="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full tracking-wide">
                    {{ item.jumlah_obat }}
                  </span>
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ item.dosis }}
                </td>

                <!-- Kolom Status Tebus -->
                <td class="px-5 py-4 text-center">
                  <button
                    :disabled="loadingToggle === item.resep_obat_id_resep"
                    :title="item.status_tebus === 'sudah' ? 'Klik untuk tandai Belum Ditebus' : 'Klik untuk tandai Sudah Ditebus'"
                    :class="[
                      'px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer select-none',
                      item.status_tebus === 'sudah'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
                      loadingToggle === item.resep_obat_id_resep ? 'opacity-60 cursor-wait' : '',
                    ]"
                    @click="toggleStatusTebus(item)"
                  >
                    {{ item.status_tebus === 'sudah' ? 'Sudah' : 'Belum' }}
                  </button>
                </td>

                <!-- Kolom Aksi -->
                <td class="px-5 py-4 align-middle">
                  <div class="flex justify-center gap-2">
                    <button
                      class="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 shadow-sm transition"
                      title="Batalkan Resep"
                      @click="openConfirmBatal(item.resep_obat_id_resep)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredResep.length === 0">
                <td colspan="7" class="py-12 text-center text-gray-400">
                  Belum ada data resep terdaftar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex justify-between items-center mt-6">
          <p class="text-sm text-gray-600">
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, filteredResep.length) }} dari {{ filteredResep.length }} data
          </p>
          <UPagination v-model:page="currentPage" active-color="primary" :total="filteredResep.length" />
        </div>
      </div>

      <!-- Confirmation Dialog Batalkan -->
      <div v-if="showConfirmDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-orange-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-orange-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 class="text-lg font-bold text-gray-800">
              Konfirmasi Pembatalan
            </h2>
          </div>
          <p class="text-gray-600 mb-6">
            Resep ini akan ditandai sebagai <span class="font-semibold text-red-600">Batal</span> dan tidak akan tampil di daftar. Data tetap tersimpan di database.
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="bg-white text-gray-600 px-6 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              @click="cancelBatal"
            >
              Kembali
            </button>
            <button
              class="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
              @click="batalkanResep"
            >
              Ya, Batalkan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
