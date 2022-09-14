import {useEffect, useState} from "react";
import "./App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Coinlink from "./components/Coinlink/Coinlink";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import {ethers} from "ethers";
import {deployCoinlink, getCoinlinkFactoryBalance, getDeployedCoinlinks,} from "./services/web3Service";
import {useWeb3} from "./Web3ModalContext";
import MainLayout from "./components/Layout/MainLayout";
import {useAppDispatch} from "./store";
import {connectWeb3} from "./store/utils";
import {useSelector} from "react-redux";
import {getAccounts, getCoinLinks, setCoinLinks} from "./store/wallet";
import Account from "./components/Account/Account";

const App = () => {
    const web3 = useWeb3();
    const dispatch = useAppDispatch();
    const coinlinks = useSelector(getCoinLinks);
    const accounts = useSelector(getAccounts);
    const [factoryBalance, setFactoryBalance] = useState("");
    const [initialAmount, setInitialAmount] = useState("");

    useEffect(() => {
        dispatch(connectWeb3());
    }, []);

    const onDeployCoinlink = async () => {
        if (!web3.signer || !web3.provider) return;
        try {
            const result = await deployCoinlink(web3.signer);
            console.log("result", result);
            dispatch(setCoinLinks(await getDeployedCoinlinks(web3.signer)));
            const balance = await getCoinlinkFactoryBalance(web3.provider);
            setFactoryBalance(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <MainLayout
                            coinlinks={coinlinks}
                            accounts={accounts}
                            initialAmount={initialAmount}
                            factoryBalance={factoryBalance}
                            onDeployCoinlink={onDeployCoinlink}
                        />
                    }
                >
                    <Route
                        path="/"
                        element={
                            <AdminPanel
                                balance={factoryBalance}
                                setBalance={setFactoryBalance}
                                initialAmount={initialAmount}
                                setInitialAmount={setInitialAmount}
                            />
                        }
                    />
                    <Route path="coinlinks/:address" element={<Coinlink/>}/>
                    <Route path="accounts/:address" element={<Account/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
