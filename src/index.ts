import { SwalClone } from './swal';
import './styles.css';

// Create and export the main instance
export const Swal = new SwalClone();

// Export types
export * from './types';

// Default export
export default Swal;