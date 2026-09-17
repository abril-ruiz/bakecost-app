import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage   from '../pages/DashboardPage';
import IngredientsPage from '../pages/IngredientsPage';
import RecipesPage     from '../pages/RecipesPage';
import RecipeFormPage  from '../pages/RecipeFormPage';
import RecipeCostPage  from '../pages/RecipeCostPage';
import SettingsPage    from '../pages/SettingsPage';
import TutorialPage    from '../pages/TutorialPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/"            element={<DashboardPage />} />

      {/* Ingredientes */}
      <Route path="/ingredients" element={<IngredientsPage />} />

      {/* Recetas */}
      <Route path="/recipes"          element={<RecipesPage />} />
      <Route path="/recipes/new"      element={<RecipeFormPage />} />
      <Route path="/recipes/:id/cost" element={<RecipeCostPage />} />

      {/* Tutorial */}
      <Route path="/tutorial" element={<TutorialPage />} />

      {/* Configuración */}
      <Route path="/settings" element={<SettingsPage />} />

      {/* Fallback — cualquier ruta desconocida devuelve 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
