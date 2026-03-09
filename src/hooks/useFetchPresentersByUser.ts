import { useEffect, useState } from "react"
import { Presenter } from "@/modules/Presenters/Presenter.types"
import { supabase } from "../lib/supabaseClient"

const PRESENTERS_TABLE = 'presenters'

export const useFetchPresentersByUser = ({ userEmail }: { userEmail: string }) => {
  const [presenters, setPresenters] = useState<Presenter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const getPresenters = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from(PRESENTERS_TABLE)
      .select('id, presented_by, presented_date, topic')
      .eq('presented_by', userEmail)
      .order('presented_date', { ascending: false })

    if (fetchError) throw fetchError
    setPresenters(data)
    setIsLoading(false)
    if (fetchError) {
      setError(fetchError)
    }
  }

  useEffect(() => {
    if (!userEmail) return
     
    getPresenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail])

  return { presenters, isLoading, error }
}