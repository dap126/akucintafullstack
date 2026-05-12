import axios from 'axios'

// Dokter
export interface Dokter {
  id_dokter?: number
  nama_dokter: string
  nip: number
  no_telpon: number
  jadwal_praktik: string
  status: string
  users_idusers: number
  poli_id_poli: number
  nama_poli?: string
}
const API_URL = 'http://localhost:3000/api/dokter'

export const dokterService = {
  // Ambil semua data dokter
  async getAllDokter(): Promise<Dokter[]> {
    const response = await axios.get(API_URL)
    return response.data
  },

  // Tambah dokter baru
  async createDokter(data: Dokter): Promise<void> {
    await axios.post(API_URL, data)
  },

  // Hapus dokter
  async deleteDokter(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`)
  },

  // Link dokter ke akun user
  async linkDokterToUser(idDokter: number, idUser: number): Promise<void> {
    await axios.patch(`${API_URL}/${idDokter}/link-user`, { users_idusers: idUser })
  },
}

// Poli
export interface Poli {
  id_poli: number
  nama_poli?: string
}

export const poliService = {
  async getAllPoli(): Promise<Poli[]> {
    const response = await axios.get(`${API_URL}/poli`)
    return response.data
  },
  // Tambah POLI
  async createPoli(data: Poli): Promise<void> {
    await axios.post(`${API_URL}/poli`, data)
  },

  // Hapus POLI
  async deletePoli(id: number): Promise<void> {
    await axios.delete(`${API_URL}/poli/${id}`)
  },
}
