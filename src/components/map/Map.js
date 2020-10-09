import './Map.sass'
import React, {Component} from 'react';
import RegionsDrawer from "./regions/RegionsDrawer";
import FloatingWindow from "../FloatingWindow/FloatingWindow";
import {Instruments} from "./regions/instruments";
import {RegionColors, Regions} from "./regions/regionColors";

class Map extends Component {
    regionsDrawerRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {}
    }


    setInstrument = instrument => () => {
        this.regionsDrawerRef.current.setInstrument(instrument);
    }

    onSelectRegionType(event) {
        const type = event.target.options[event.target.selectedIndex].value;
        this.regionsDrawerRef.current.onChangeSelectedRegionType(type)
        this.setState({
            ...this.state,
            selectedRegionType: type
        })
    }

    onSelectRegion(regionText, regionId, regionType) {
        console.log(regionType);
        this.setState({
            ...this.state,
            selectedRegionType: regionType
        })
    }

    onDeselectRegion() {
        console.log("deselect");
    }

    render() {
        const options = Object.keys(RegionColors).map(key => {
            return (
                <option value={key} key={key}>{key}</option>
            );

        });

        return (
            <div className="map">
                <RegionsDrawer onSetInstrument={this.onSetInstrument} onSelectRegion={this.onSelectRegion.bind(this)}
                               onDeselectRegion={this.onDeselectRegion.bind(this)}
                               ref={this.regionsDrawerRef}
                               viewDots={false} viewRegionTexts={false}/>
                <FloatingWindow className="instrumentsPanel">
                    <div className="instrumentButton pointerInstrument"
                         onClick={this.setInstrument(Instruments.REGION_DRAWING).bind(this)}>
                        <i className="fas fa-pencil-ruler"/> Region drawing
                    </div>
                    <div className="instrumentButton eraseInstrument"
                         onClick={this.setInstrument(Instruments.ERASER).bind(this)}>
                        <i className="fas fa-eraser"/> Eraser
                    </div>
                    <label>Region owner </label>
                    <select onChange={this.onSelectRegionType.bind(this)}
                            value={this.state.selectedRegionType !== undefined ? this.state.selectedRegionType : Regions.rebels}>
                        {options}
                    </select>

                    <button onClick={() => this.regionsDrawerRef.current.saveDataToLocalStorage()}>Save</button>
                    <button onClick={() => this.regionsDrawerRef.current.retrieveDataFromLocalStorage()}>Load</button>
                    <button onClick={() => this.regionsDrawerRef.current.downloadData()}>Download</button>
                </FloatingWindow>
            </div>
        );
    }
}

export default Map;