import { test, expect } from "@playwright/test"

test("abre dashboard e exibe título", async ({ page }) => {
  await page.goto("http://localhost:3000")
  await expect(page.getByRole("heading", { name: "Multiagente IA" })).toBeVisible()
})

test("navega para Admin e carrega tabs", async ({ page }) => {
  await page.goto("http://localhost:3000")
  await page.getByRole("button", { name: "Admin" }).click()
  await expect(page.getByRole("heading", { name: "Área Admin" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Configurações" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Preview" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Arquivos" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Logs" })).toBeVisible()
})