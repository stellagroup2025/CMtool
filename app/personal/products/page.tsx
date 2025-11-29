"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string
  category?: string
  price?: number
  currency?: string
  features: string[]
  targetAudience?: string
  imageUrl?: string
  productUrl?: string
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [featuresText, setFeaturesText] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [productUrl, setProductUrl] = useState("")
  const [tagsText, setTagsText] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/personal/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        toast.error("Error al cargar productos")
      }
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setShortDescription("")
    setCategory("")
    setPrice("")
    setCurrency("USD")
    setFeaturesText("")
    setTargetAudience("")
    setImageUrl("")
    setProductUrl("")
    setTagsText("")
    setIsActive(true)
  }

  const loadProductToForm = (product: Product) => {
    setName(product.name)
    setDescription(product.description)
    setShortDescription(product.shortDescription || "")
    setCategory(product.category || "")
    setPrice(product.price ? product.price.toString() : "")
    setCurrency(product.currency || "USD")
    setFeaturesText(product.features.join("\n"))
    setTargetAudience(product.targetAudience || "")
    setImageUrl(product.imageUrl || "")
    setProductUrl(product.productUrl || "")
    setTagsText(product.tags.join(", "))
    setIsActive(product.isActive)
  }

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Nombre y descripción son requeridos")
      return
    }

    setSaving(true)
    try {
      const features = featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0)

      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const response = await fetch("/api/personal/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          shortDescription: shortDescription || undefined,
          category: category || undefined,
          price: price ? parseFloat(price) : undefined,
          currency: currency || undefined,
          features,
          targetAudience: targetAudience || undefined,
          imageUrl: imageUrl || undefined,
          productUrl: productUrl || undefined,
          tags,
        }),
      })

      if (response.ok) {
        toast.success("Producto creado exitosamente")
        setCreateDialogOpen(false)
        resetForm()
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear producto")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("Error al crear producto")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedProduct || !name.trim() || !description.trim()) {
      toast.error("Nombre y descripción son requeridos")
      return
    }

    setSaving(true)
    try {
      const features = featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0)

      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const response = await fetch(`/api/personal/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          shortDescription: shortDescription || undefined,
          category: category || undefined,
          price: price ? parseFloat(price) : undefined,
          currency: currency || undefined,
          features,
          targetAudience: targetAudience || undefined,
          imageUrl: imageUrl || undefined,
          productUrl: productUrl || undefined,
          tags,
          isActive,
        }),
      })

      if (response.ok) {
        toast.success("Producto actualizado exitosamente")
        setEditDialogOpen(false)
        setSelectedProduct(null)
        resetForm()
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar producto")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Error al actualizar producto")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/personal/products/${selectedProduct.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Producto eliminado exitosamente")
        setDeleteDialogOpen(false)
        setSelectedProduct(null)
        loadProducts()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al eliminar producto")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error al eliminar producto")
    } finally {
      setDeleting(false)
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    loadProductToForm(product)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
              <Package className="h-8 w-8 text-primary" />
              Mis Productos
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus productos para generar contenido enfocado
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={resetForm}>
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Agrega la información de tu producto para crear contenido específico
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Mi SaaS Premium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Pitch Corto</Label>
                  <Input
                    id="shortDescription"
                    placeholder="Ej: La plataforma todo-en-uno para gestión de proyectos"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Completa *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu producto en detalle..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Category and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      placeholder="Ej: SaaS, E-learning, etc."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <div className="flex gap-2">
                      <Input
                        id="currency"
                        placeholder="USD"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        id="price"
                        type="number"
                        placeholder="99.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label htmlFor="features">Características Clave</Label>
                  <Textarea
                    id="features"
                    placeholder="Una característica por línea&#10;Ej: Integración con 50+ herramientas&#10;Reportes en tiempo real&#10;Soporte 24/7"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Escribe una característica por línea
                  </p>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Audiencia Objetivo</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="Ej: Equipos de marketing de 5-50 personas en empresas SaaS B2B"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* URLs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL de Imagen</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productUrl">URL del Producto</Label>
                    <Input
                      id="productUrl"
                      placeholder="https://..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="saas, productividad, marketing"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separados por comas
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Producto
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tienes productos aún</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crea tu primer producto para generar contenido enfocado en él
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {product.name}
                    </CardTitle>
                    {product.category && (
                      <Badge variant="outline" className="mt-2">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  {product.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.shortDescription && (
                  <p className="text-sm font-medium text-primary">
                    {product.shortDescription}
                  </p>
                )}

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description}
                </p>

                {product.price && product.currency && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">
                      {product.currency} {product.price}
                    </span>
                  </div>
                )}

                {product.features.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Características:
                    </p>
                    <ul className="text-xs space-y-0.5">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {product.features.length > 3 && (
                        <li className="text-muted-foreground">
                          +{product.features.length - 3} más
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => openDeleteDialog(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Actualiza la información de tu producto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Same form fields as create dialog */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Producto *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-shortDescription">Pitch Corto</Label>
              <Input
                id="edit-shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción Completa *</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Input
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-20"
                  />
                  <Input
                    id="edit-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-features">Características Clave</Label>
              <Textarea
                id="edit-features"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-targetAudience">Audiencia Objetivo</Label>
              <Textarea
                id="edit-targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">URL de Imagen</Label>
                <Input
                  id="edit-imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-productUrl">URL del Producto</Label>
                <Input
                  id="edit-productUrl"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isActive" className="cursor-pointer">
                Producto activo
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{selectedProduct?.name}" será
              eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
