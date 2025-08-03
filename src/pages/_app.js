import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-bs5/js/dataTables.bootstrap5.min.js';
import {useEffect} from "react";
import '../styles/globals.css';
import '../styles/Dashboard.css';
import '../styles/admin-account.css';
import '../styles/user-management.css';
import '../styles/view-photos.css';


function MyApp({ Component, pageProps }) {

    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

  return <Component {...pageProps} />;
}

export default MyApp;