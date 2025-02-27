type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
    duration?: number
}

export function toast({title, description, variant = "default", duration = 3000}: ToastProps) {
    // Create a toast element
    const toastElement = document.createElement("div")
    toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-md max-w-md ${
        variant === "destructive" ? "bg-red-600" : "bg-accent"
    } text-white`

    // Create toast content
    const content = document.createElement("div")
    content.className = "flex flex-col gap-1"

    if (title) {
        const titleElement = document.createElement("h3")
        titleElement.className = "font-medium"
        titleElement.textContent = title
        content.appendChild(titleElement)
    }

    if (description) {
        const descElement = document.createElement("p")
        descElement.className = "text-sm"
        descElement.textContent = description
        content.appendChild(descElement)
    }

    toastElement.appendChild(content)
    document.body.appendChild(toastElement)

    // Add animation
    toastElement.style.opacity = "0"
    toastElement.style.transform = "translateX(20px)"
    toastElement.style.transition = "opacity 150ms, transform 150ms"

    setTimeout(() => {
        toastElement.style.opacity = "1"
        toastElement.style.transform = "translateX(0)"
    }, 10)

    // Remove after duration
    setTimeout(() => {
        toastElement.style.opacity = "0"
        toastElement.style.transform = "translateX(20px)"

        setTimeout(() => {
            document.body.removeChild(toastElement)
        }, 150)
    }, duration)
}

