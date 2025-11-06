import { test, expect } from "@playwright/test"

test("abre dashboard e exibe título", async ({ page }) => {
  await page.goto("http://localhost:3000")
  await expect(page.getByRole("heading", { name: "Multiagente IA" })).toBeVisible()
})

test("navega para Admin e verifica acesso ou tabs", async ({ page }) => {
  await page.goto("http://localhost:3000")
  // Botão Admin pode ser um Link estilizado como botão; tentamos ambos
  const adminButton = page.getByRole("button", { name: "Admin" })
  if (await adminButton.count()) {
    await adminButton.click()
  } else {
    await page.getByRole("link", { name: "Admin" }).click()
  }
  await expect(page.getByRole("heading", { name: "Área Admin" })).toBeVisible()

  const restrictedCount = await page.getByText("Acesso Restrito").count()
  if (restrictedCount > 0) {
    await expect(page.getByText("Faça login para acessar a área administrativa.")).toBeVisible()
  } else {
    await expect(page.getByRole("tab", { name: "Configurações" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Preview" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Arquivos" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Logs" })).toBeVisible()
  }
})