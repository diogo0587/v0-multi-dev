"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SettingsContextType {
  apiKey: string | null
  setApiKey: (key: string) => void
  clearApiKey: () => void
  model: string
  setModel: (model: string) => void
  temperature: number
  setTemperature: (temp: number) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null)
  const [model, setModelState] = useState("gemini-2.0-flash-exp")
  const [temperature, setTemperatureState] = useState(0.7)

  // Carregar configurações do localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key")
    const storedModel = localStorage.getItem("ai_model")
    const storedTemp = localStorage.getItem("ai_temperature")

    if (storedKey) setApiKeyState(storedKey)
    if (storedModel) setModelState(storedModel)
    if (storedTemp) setTemperatureState(Number.parseFloat(storedTemp))
  }, [])

  const setApiKey = (key: string) => {
    localStorage.setItem("gemini_api_key", key)
    setApiKeyState(key)
  }

  const clearApiKey = () => {
    localStorage.removeItem("gemini_api_key")
    setApiKeyState(null)
  }

  const setModel = (newModel: string) => {
    localStorage.setItem("ai_model", newModel)
    setModelState(newModel)
  }

  const setTemperature = (temp: number) => {
    localStorage.setItem("ai_temperature", temp.toString())
    setTemperatureState(temp)
  }

  return (
    <SettingsContext.Provider
      value={{
        apiKey,
        setApiKey,
        clearApiKey,
        model,
        setModel,
        temperature,
        setTemperature,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}
