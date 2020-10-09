import './RegionsDrawer.sass'
import React, {Component} from 'react';
import {Circle, Stage, Layer, Path} from "react-konva";
import {MapImage} from "../MapImage";
import {createSvgAreaPathDataFromDots, createSvgPathDataFromDots} from "../utils/svgUtils";
import {KonvaStyling} from "../utils/konvaStyling";
import {Instruments} from "./instruments";
import {deleteDot} from "../utils/regionsUtils";
import {RegionColors, Regions} from "./regionColors";
import {downloadFile} from "../../../utils/fileUtils";

class RegionsDrawer extends Component {
    activeInstrument = Instruments.REGION_DRAWING;
    wrapperDivRef = React.createRef();
    konvaStyling = new KonvaStyling({
        region: {
            stroke: 'black',
            strokeWidth: 2,
            opacity: 0.4,
            shadowForStrokeEnabled: false,
            perfectDrawEnabled: false
        },
        hoveredRegion: {
            opacity: 0.7
        },
        selectedRegion: {
            opacity: 0.7,
            strokeWidth: 4,
        },
        newRegion: {
            stroke: 'black',
            strokeWidth: 4
        },
        dot: {
            radius: 10,
            fill: 'red',
            stroke: 'black',
            shadowForStrokeEnabled: false,
        },
        regionText: {
            fill: 'black',
            fontSize: 25,
        }
    });

    constructor(props) {
        super(props);
        this.state = {
            dots: [],
            stageSize: {
                stageWidth: 0,
                stageHeight: 0
            },
            regionDots: [],
            regions: [],
            hoveredRegionIndex: -1,
            selectedRegionIndex: -1
        }
    }

    componentDidMount() {
        this.adaptStageSize();
        window.addEventListener("resize", this.adaptStageSize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.adaptStageSize);
    }

    setInstrument(instrument) {
        this.activeInstrument = instrument;
        if (this.activeInstrument !== Instruments.REGION_DRAWING) {
            this.setState({
                ...this.state,
                regionDots: []
            })
        }
    }

    adaptStageSize = () => {
        const CANVAS_NATIVE_WIDTH = 1440
        const CANVAS_NATIVE_HEIGHT = 1440

        const wrapper = this.wrapperDivRef.current;
        const width = wrapper.offsetWidth;
        const height = wrapper.offsetHeight;

        const scale = Math.min(
            width / CANVAS_NATIVE_WIDTH,
            height / CANVAS_NATIVE_HEIGHT
        );
        this.setState({
            ...this.state,
            stageSize: {
                stageWidth: width,
                stageHeight: height,
                scale: scale,
            }
        });
    };

    onMapLayerClick(event) {
        if (this.isRegionSelectedState()) {
            this.setState({
                ...this.state,
                selectedRegionIndex: -1
            });
            this.props.onDeselectRegion();
        } else {
            const dots = this.state.dots;
            const scale = this.state.stageSize.scale;
            const newDot = {
                x: event.evt.pageX / scale,
                y: event.evt.pageY / scale,
            };
            dots.push(
                newDot
            );

            if (this.isCreatingRegionState()) {
                const regionDots = this.state.regionDots;
                regionDots.push({
                    dotIndex: dots.length - 1,
                    dotCoords: newDot,
                });
                this.setState(
                    {
                        ...this.state,
                        dots: dots,
                        regionDots: regionDots,
                    }
                )
            } else {
                this.setState({...this.state, dots: dots});
            }
        }
    }

    changeCursor = (cursor) => () => {
        document.getElementsByTagName('body')[0].style.cursor = cursor;
    }

    isCreatingRegionState() {
        return this.state.regionDots.length !== 0 && this.state.selectedRegionIndex === -1;
    }

    isRegionSelectedState() {
        return this.state.selectedRegionIndex !== -1;
    }

    onDotClick = (dotIndex) => () => {
        if (this.activeInstrument === Instruments.REGION_DRAWING) {
            let regionDots = this.state.regionDots;
            if (regionDots.length !== 0 && regionDots[0].dotIndex === dotIndex) {
                this.createRegion(regionDots.map(regionDot => regionDot.dotIndex));
                regionDots = [];
            } else {
                regionDots.push({
                    dotIndex: dotIndex,
                    dotCoords: this.state.dots[dotIndex]
                });
            }
            this.setState({...this.state, regionDots: regionDots});
        } else {
            this.eraseDot(dotIndex);
        }
    }

    eraseDot(dotIndex) {
        const deletionResult = deleteDot(this.state.dots, this.state.regions, dotIndex);
        this.setState({
            ...this.state,
            regions: deletionResult.regionsList,
            dots: deletionResult.dotsList,
        });
        this.changeCursor('auto');
    }

    onDotMove = (dotIndex) => (event) => {
        const dots = this.state.dots;
        dots[dotIndex] = {
            x: event.target.x(),
            y: event.target.y()
        };
        this.setState({...this.state, dots: dots});
    }

    onRegionTextMove = (regionIndex) => (event) => {
        const regions = this.state.regions;
        regions[regionIndex] = {
            ...regions[regionIndex],
            textPosX: event.target.x(),
            textPosY: event.target.y()
        };
        this.setState({...this.state, regions: regions});
    }

    createRegion(dotsIndices) {
        const regions = this.state.regions;
        const firstDot = this.state.dots[dotsIndices[0]];
        regions.push({
            dotsIndices: dotsIndices,
            regionText: 'Region#' + (regions.length + 1),
            textPosX: firstDot.x,
            textPosY: firstDot.y,
            regionType: Regions.rebels
        });
        this.setState({...this.state, regions: regions});
    }

    onRegionMouseOver = regionIndex => () => {
        this.setState({
            ...this.state,
            hoveredRegionIndex: regionIndex
        });
    }

    onRegionMouseOut = regionIndex => () => {
        this.setState({
            ...this.state,
            hoveredRegionIndex: -1
        });
    }

    onRegionClick = regionIndex => () => {
        this.props.onSelectRegion(this.state.regions[regionIndex].regionText, regionIndex, this.state.regions[regionIndex].regionType);
        this.setState({
            ...this.state,
            selectedRegionIndex: regionIndex
        });
    }

    onChangeSelectedRegionType(newRegionType) {
        if (this.isRegionSelectedState()) {
            const selectedRegionIndex = this.state.selectedRegionIndex;
            const regions = this.state.regions;
            regions[selectedRegionIndex].regionType = newRegionType;
            this.setState({
                ...this.state,
                regions: regions
            })
        }
    }

    downloadData() {
        downloadFile(this.serializeState(), 'regionsStates.json', 'json');
    }

    saveDataToLocalStorage() {
        localStorage.setItem('regionsDrawerData', this.serializeState());
    }

    retrieveDataFromLocalStorage() {
        const serializedState = localStorage.getItem('regionsDrawerData');
        this.deserializeState(serializedState);
    }

    serializeState() {
        return JSON.stringify({
            dots: this.state.dots,
            regions: this.state.regions
        })
    }

    deserializeState(serializedState) {
        const state = JSON.parse(serializedState);
        this.setState({
            ...this.state,
            dots: state.dots,
            regions: state.regions
        });
    }

    render() {
        const dots = this.state.dots;
        const stageSize = this.state.stageSize;
        const circlesLayer = (
            <Layer>
                {this.props.viewDots && dots.map((dot, index) => (
                    this.konvaStyling.stylizeElement(
                        <Circle x={dot.x} y={dot.y}
                                draggable
                                radius={0}
                                onMouseOver={this.changeCursor('pointer')}
                                onMouseOut={this.changeCursor('auto')}
                                onDragMove={this.onDotMove(index).bind(this)}
                                onClick={this.onDotClick(index).bind(this)}
                                className={'dot'} key={index}/>)
                ))}
            </Layer>);

        const newRegionPathLayer = this.state.regionDots.length !== 0 && (
            <Layer key="newRegionKey" listening={false}>
                {this.konvaStyling.stylizeElement(
                    <Path
                        data={createSvgPathDataFromDots(this.state.regionDots.map(regionDot => dots[regionDot.dotIndex]))}
                        strokeWidth={4} className="newRegion"/>)}
            </Layer>
        );

        const regionsLayers = this.state.regions.map((region, index) => {
                const className = 'region' + (this.state.hoveredRegionIndex === index ? ' hoveredRegion' : '')
                    + (this.state.selectedRegionIndex === index ? ' selectedRegion' : '');

                return (this.konvaStyling.stylizeElement(
                        <Path data={createSvgAreaPathDataFromDots(region.dotsIndices.map(dotIndex => dots[dotIndex]))}
                              className={className} onMouseOver={this.onRegionMouseOver(index).bind(this)}
                              onMouseOut={this.onRegionMouseOut(index).bind(this)}
                              onClick={this.onRegionClick(index).bind(this)}
                              fill={RegionColors[region.regionType]} key={index}/>)
                );
            }
        );

        return (
            <div ref={this.wrapperDivRef} className="stageWrapper">
                <Stage width={stageSize.stageWidth}
                       height={stageSize.stageHeight} scaleX={stageSize.scale} scaleY={stageSize.scale}>
                    <Layer onClick={this.onMapLayerClick.bind(this)}>
                        <MapImage/>
                    </Layer>
                    <Layer>
                        {regionsLayers}
                    </Layer>
                    {newRegionPathLayer}
                    {circlesLayer}
                </Stage>
            </div>
        );
    }
}

export default RegionsDrawer;