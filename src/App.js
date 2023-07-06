import {Box, createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import ModalContainer from "react-modal-promise";

import SourceSelector from "./components/SourceSelector";
import WaypointList from "./components/WaypointList";
import {dcsPointActions} from "./store/dcsPoint";
import {waypointsActions} from "./store/waypoints";
import theWayTheme from "./theme/TheWayTheme";
import TransferControls from "./components/TransferControls";
import TitleBar from "./components/TitleBar";
import ConvertModuleWaypoints from "./utils/ConvertModuleWaypoints";
import GetModuleCommands from "./moduleCommands/GetModuleCommands";
import askUserAboutSeat from "./moduleCommands/askUserAboutSeat";

const {ipcRenderer} = window.require("electron");

const theme = createTheme(theWayTheme);

function App() {
    const dispatch = useDispatch();
    const {module, lat, long, elev} = useSelector((state) => state.dcsPoint);
    const dcsWaypoints = useSelector((state) => state.waypoints.dcsWaypoints);

    const latRef = useRef();
    const longRef = useRef();
    const elevRef = useRef();
    const moduleRef = useRef();
    const dcsWaypointsRef = useRef();
    useEffect(() => {
        latRef.current = lat;
        longRef.current = long;
        elevRef.current = elev;
        moduleRef.current = module;
        dcsWaypointsRef.current = dcsWaypoints;
    }, [lat, long, elev, module, dcsWaypoints]);

    useEffect(() => {
        ipcRenderer.on("dataReceived", (event, msg) => {
            dispatch(dcsPointActions.changeCoords(JSON.parse(msg)));
        });
        ipcRenderer.on("fileOpened", (event, msg) => {
            dispatch(waypointsActions.appendWaypoints(msg));
        });
        ipcRenderer.on("saveWaypoint", () => {
            dispatch(
                waypointsActions.addDcsWaypoint({
                    lat: latRef.current,
                    long: longRef.current,
                    elev: elevRef.current,
                })
            );
        });
        ipcRenderer.on("transferWaypoints", () => {
            handleTransfer();
        });
        ipcRenderer.on("deleteWaypoints", () => {
            dispatch(waypointsActions.deleteAll());
        });
    }, []);

    const handleTransfer = () => {
        const moduleWaypoints = ConvertModuleWaypoints(
            dcsWaypointsRef.current,
            moduleRef.current
        );
        // Check for special cases which require additional pilot feedback
        const seatInModule = askUserAboutSeat(moduleRef.current);
        const commands = GetModuleCommands(seatInModule, moduleWaypoints);
        ipcRenderer.send("transfer", commands);
    };

    const handleFileSave = () => {
        ipcRenderer.send("saveFile", JSON.stringify(dcsWaypoints));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <TitleBar/>
            <ModalContainer/>
            <Box sx={{height: "100vh"}}>
                <Box sx={{height: "25%"}}>
                    <SourceSelector/>
                </Box>
                <Box sx={{height: "60%", paddingX: 2}}>
                    <WaypointList/>
                </Box>
                <Box sx={{height: "15%"}}>
                    <TransferControls
                        onTransfer={handleTransfer}
                        onSaveFile={handleFileSave}
                    />
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
