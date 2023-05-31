import { useState } from "react";

// CONTEXT
import { ViewportProvider } from "./context/ViewportContext";

import Loader from "./components/Loader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CardReactProp from "./components/CardReactProp";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 3000);

  return (
    <ViewportProvider>
      <div className="full-container v-centered-content">
        <div className="bulb-primary puff-in-center"></div>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div style={{ width: "100%" }}>
              <Header />
              <CardReactProp />
              <Footer />
              <div className="footer-frame"></div>
            </div>
          </>
        )}
      </div>
    </ViewportProvider>
  );
};

export default App;
