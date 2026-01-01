export const CustomScrollbarStyles = () => {
  return (
    <style>{`
      /* Dark Theme Scrollbar (.custom-scrollbar-dark) */
      .custom-scrollbar-dark {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
      }
      .custom-scrollbar-dark::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .custom-scrollbar-dark::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar-dark::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.25);
        border-radius: 10px;
      }
      .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.35);
      }

      /* Light Theme Scrollbar (.custom-scrollbar-light) */
      .custom-scrollbar-light {
        scrollbar-width: thin;
        scrollbar-color: #C5C6D0 transparent;
      }
      .custom-scrollbar-light::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      @media (max-width: 768px) {
        .custom-scrollbar-light::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
      }
      .custom-scrollbar-light::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar-light::-webkit-scrollbar-thumb {
        background-color: #C5C6D0;
        border-radius: 10px;
      }
      .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
        background-color: #A8A9B3;
      }
    `}</style>
  );
};
