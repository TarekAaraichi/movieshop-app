/**
 * Components index
 * Re-export commonly used UI components for convenient imports.
 */

export { default as AddButton } from "./AddButton";
// AddToCart components exported below once to avoid duplicate identifier errors
export { default as CartClient } from "./CartClient";
export { CartCountProvider, useCartCount } from "./CartCountContext";
export { default as CartCountBadge } from "./CartCountBadge";
export { default as ClientShell } from "./ClientShell";
export { default as AdminSearchInput } from "./AdminSearchInput";
export { default as AdminTabSwitcher } from "./AdminTabSwitcher";
export { default as GenreSelect } from "./GenreSelect";
export { default as MovieSearch } from "./MovieSearch";
export { default as NavBarClient } from "./NavBarClient";
export { default as SaveButton } from "./SaveButton";
export { default as AutoSubmitSelect } from "./AutoSubmitSelect";
export { default as AddToCartClientButton } from "./AddToCartClientButton";
export { default as AddToCartButton } from "./AddToCartButton";
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
} from "./ui/card";
export { Button } from "./ui/button";
export { Label } from "./ui/label";
export { Input } from "./ui/input";
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "./ui/form";
export { MovieCard } from "./MovieCard";
export { MoviesGrid } from "./MoviesGrid";
export { MoviesGridSkeleton, MovieCardSkeleton } from "./MoviesGridSkeleton";
export { MovieCarousel } from "./MovieCarousel";
export { default as PaginationControls } from "./PaginationControls";
export { PaginationControlsSkeleton } from "./PaginationControlsSkeleton";
export { YearFilter } from "./YearFilter";
// SignInSkeleton removed — exported earlier but deleted
