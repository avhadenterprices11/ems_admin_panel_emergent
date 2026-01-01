import { useFormik } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';

export const FormikForm = ({ children, initialValues, validationSchema, onSubmit }) => {
  const formik = useFormik({
    initialValues,
    validationSchema: toFormikValidationSchema(validationSchema),
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {children(formik)}
    </form>
  );
};
