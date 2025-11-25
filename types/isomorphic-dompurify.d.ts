declare module 'isomorphic-dompurify' {
  import type createDOMPurify from 'dompurify';
  const DOMPurify: ReturnType<typeof createDOMPurify> & typeof createDOMPurify;
  export default DOMPurify;
}
