import { createContext, useContext, useState } from 'react'

const ProjetActifContext = createContext()

export function ProjetActifProvider({ children }) {
  // 'tous' = pas de filtre ; sinon l'id du projet sélectionné
  const [projetActif, setProjetActif] = useState('tous')

  return (
    <ProjetActifContext.Provider value={{ projetActif, setProjetActif }}>
      {children}
    </ProjetActifContext.Provider>
  )
}

export function useProjetActif() {
  const ctx = useContext(ProjetActifContext)
  if (!ctx) {
    throw new Error('useProjetActif doit être utilisé dans un ProjetActifProvider')
  }
  return ctx
}