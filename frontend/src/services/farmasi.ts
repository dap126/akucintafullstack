import axios from 'axios'

export interface Obat {
  id_obat?: number
  nama_obat: string
  kategori: string
  stok: number
  satuan: string
}

const API_URL_OBAT = 'http://localhost:3000/api/obat'

export const obatService = {
  async getAllObat(): Promise<Obat[]> {
    const response = await axios.get(API_URL_OBAT)
    return response.data
  },

  async createObat(data: Obat) {
    const response = await axios.post(API_URL_OBAT, data)
    return response.data
  },

  async deleteObat(id: number) {
    const response = await axios.delete(`${API_URL_OBAT}/${id}`)
    return response.data
  },
}

const API_URL_DETAILRESEP = 'http://localhost:3000/api/detail-resep'
const API_URL_RESEPOBAT   = 'http://localhost:3000/api/resep-obat'

export interface DetailResep {
  id_detail?: number
  no_resep: string
  jumlah_obat: number
  dosis: string
  resep_obat_id_resep: number
  obat_id_obat: number
  nama_obat: string
  nama_pasien: string
  status_tebus: 'belum' | 'sudah' | 'batal'
}

export const detailresepService = {
  async getAllDetailResep(): Promise<DetailResep[]> {
    const response = await axios.get(API_URL_DETAILRESEP)
    return response.data
  },

  async createDetailResep(data: { obat_id: number; jumlah_obat: number; dosis: string }) {
    const response = await axios.post(API_URL_DETAILRESEP, data)
    return response.data
  },

  // Soft delete: ubah status_tebus = 'batal' (data tetap di DB)
  async batalResep(idResep: number) {
    const response = await axios.patch(`${API_URL_RESEPOBAT}/${idResep}/batal`)
    return response.data
  },

  // Toggle status tebus: 'belum' ↔ 'sudah'
  async updateStatusTebus(idResep: number, status: 'belum' | 'sudah') {
    const response = await axios.patch(`${API_URL_RESEPOBAT}/${idResep}/status`, { status_tebus: status })
    return response.data
  },
}
