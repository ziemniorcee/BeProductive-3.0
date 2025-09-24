// SpotlightOverlay.class.jsx
import React, {PureComponent} from "react";
import {View, StyleSheet, Platform, Pressable, Modal} from "react-native";
import Svg, {Defs, Mask, Rect, RadialGradient, Stop} from "react-native-svg";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default class Vignette extends PureComponent {
    static defaultProps = {
        opacity: 0.6,
        radius: "85%",
        window: {x: null, y: null, width: 0, height: 0, rx: 24},
    };

    state = {w: 0, h: 0};
    onLayout = e => {
        const {width, height} = e.nativeEvent.layout;
        this.setState({w: width, h: height});
    };

    allowClose = true;

    getRect() {
        const {w, h} = this.state;
        const win = this.props.window;
        this.allowClose = win.allowClose ?? true;

        let web_width = Math.round(w * win.width)
        let web_height = Math.round(h * win.height)

        if (web_width < 500) {
            web_width = 500;
        }

        if (web_height < 600) {
            web_height = 600;
        }

        const width = Platform.select({
            web: web_width,
            default: "100%"
        });

        const height = Platform.select({
            web: web_height,
            default: h - 100
        });
        const x = win.x ?? Math.round((w - width) / 2);
        const y = win.y ?? Math.round((h - height) / 2);
        const rx = win.rx ?? 24;
        return {x, y, width, height, rx};
    }

    close = () => {
        if (this.allowClose) {
            console.log("TERA")
            this.props.onClose();
        }
    };

    render() {
        const {w, h} = this.state;
        const {opacity, radius, children, style, app} = this.props;
        const r = this.getRect();

        return (
            <Modal transparent animationType="fade">
                <GestureHandlerRootView style={{ flex: 1 }}>
                <Pressable style={{
                    ...StyleSheet.absoluteFillObject,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)"}}
                    onPress={() => this.close()}>
                    <View style={[StyleSheet.absoluteFill, style]} onLayout={this.onLayout}>
                        {w > 0 && h > 0 && (
                            <Pressable onPress={() => console.log('pressed')} style={{cursor: 'default'}}>
                                {/* center block, interactive */}
                                <View
                                    style={{
                                        position: "absolute",
                                        left: r.x,
                                        top: r.y,
                                        width: Platform.select({web: r.width ?? '100%', default: "100%"}),
                                        height: r.height,
                                        borderRadius: r.rx,
                                        backgroundColor: "#000000F1", // semi-opaque card
                                        borderWidth: 1,
                                        borderColor: "#FFFFFF33",
                                        overflow: "hidden",
                                    }}
                                >
                                    {children /* put your content here */}
                                </View>
                            </Pressable>
                        )}
                    </View>
                </Pressable>
                </GestureHandlerRootView>
            </Modal>
        );
    }
}
