import axios from 'axios'

export interface medis {
  id_rm: number
  tgl_periksa: number
  keluhan: string
  tinggi_badan: number
  berat_badan: number
  tekanan_darah: string
  diagnosa: string
  pasien_idpasien: string
  dokter_id_dokter: string
}

const API_URL_MEDIS = 'http://localhost:3000/api/medis'

export const medisService = {
  // Ambil semua data medis
  async getAllMedis(): Promise<medis[]> {
    const response = await axios.get(API_URL_MEDIS)
    return response.data
  },

  // Tambah data medis baru
  async createMedis(data: medis): Promise<any> {
    const response = await axios.post(API_URL_MEDIS, data)
    return response.data
  },

  // Update data medis
  async updateMedis(id: number, data: Partial<medis>): Promise<any> {
    const response = await axios.put(`${API_URL_MEDIS}/${id}`, data)
    return response.data
  },

  // Hapus data medis
  async deleteMedis(id: number): Promise<void> {
    await axios.delete(`${API_URL_MEDIS}/${id}`)
  },
}

const API_URL_RESEP = 'http://localhost:3000/api/resep'
export interface resep {
  id_resep: number
  tgl_resep: number
  status_tebus: string
  rekam_medis_id_rm: number
}

export const resepService = {
  // Ambil semua resep medis
  async getAllResep(): Promise<resep[]> {
    const response = await axios.get(API_URL_RESEP)
    return response.data
  },

  // Tambah data resep baru
  async createResep(data: resep): Promise<void> {
    await axios.post(API_URL_RESEP, data)
  },

  // Tambah resep menggunakan database transaction (banyak obat sekaligus)
  async createResepTransaction(payload: { rekam_medis_id_rm: number; daftar_obat: any[] }): Promise<any> {
    const response = await axios.post(API_URL_RESEP, payload)
    return response.data
  },

  // Hapus data resep
  async deleteResep(id: number): Promise<void> {
    await axios.delete(`${API_URL_RESEP}/${id}`)
  },

  // Ambil resep berdasarkan id_rm
  async getResepByRm(id_rm: number): Promise<any[]> {
    const response = await axios.get(`${API_URL_RESEP}/by-rm/${id_rm}`)
    return response.data
  },

  // Update resep berdasarkan id_rm
  async updateResepByRm(id_rm: number, payload: { daftar_obat: any[] }): Promise<any> {
    const response = await axios.put(`${API_URL_RESEP}/by-rm/${id_rm}`, payload)
    return response.data
  },
}
