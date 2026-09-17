import { Container } from '@mui/material';
import RecipeForm from '../components/forms/RecipeForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function RecipeFormPage() {
  // Título dinámico
   useDocumentTitle('Nueva Receta');
  return (
    <Container maxWidth="lg">
      <RecipeForm />
    </Container>
  );
}