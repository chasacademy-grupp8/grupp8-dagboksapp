import { FaSun, FaMoon } from "react-icons/fa"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative rounded-full w-10 h-10"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <FaSun
        className={`absolute inset-0 m-auto h-6 w-6 transition-all duration-500 ${
          theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
      <FaMoon
        className={`absolute inset-0 m-auto h-6 w-6 transition-all duration-500 ${
          theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
    </Button>
  )
}
