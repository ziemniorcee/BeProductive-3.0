import React from "react";
import {Modal, Platform, Pressable, StyleSheet, View, Dimensions, AppState} from "react-native";
import Field from "../../../../common/Field";
import Pill from "../../../../common/Pill";
import SelectionCard from "../../../../common/SelectionCard";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function EditPicker({label, current, children}) {
    const anchorRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const [pos, setPos] = React.useState(null); // {left, top, width}

    const rafRef = React.useRef(0);
    const setPosSafe = React.useCallback((next) => {
        setPos(prev =>
            prev && prev.left === next.left && prev.top === next.top && prev.width === next.width
                ? prev
                : next
        );
    }, []);

    const GUTTER = 8;
    const EST_POPUP_H = 500;   // calendar + padding; tweak if needed
    const MIN_BELOW = EST_POPUP_H;

    const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

    const recalc = React.useCallback(() => {
        if (!anchorRef.current?.measureInWindow) return;
        anchorRef.current.measureInWindow((x, y, w, h) => {
            const { width: vw, height: vh } = Dimensions.get("window");
            const popupW = Math.max(w, 260);

            const spaceBelow = vh - (y + h) - GUTTER;
            const place = spaceBelow >= MIN_BELOW ? "below" : "left";

            let left, top, maxHeight;

            if (place === "below") {
                left = clamp(x + (w - popupW) / 2, GUTTER, vw - popupW - GUTTER);
                top = y + h + 6;
                maxHeight = Math.max(120, spaceBelow); // keep fully visible
            } else {
                left = clamp(x - popupW - 20, GUTTER, vw - popupW - GUTTER);
                const maxTop = vh - EST_POPUP_H - GUTTER;
                top = clamp(y, GUTTER, Math.max(GUTTER, maxTop));
                maxHeight = vh - 2 * GUTTER;
            }

            setPos(prev => {
                const next = {
                    left: Math.round(left),
                    top: Math.round(top),
                    width: popupW,
                    placement: place,
                    maxHeight
                };
                return prev &&
                prev.left === next.left &&
                prev.top === next.top &&
                prev.width === next.width &&
                prev.placement === next.placement &&
                prev.maxHeight === next.maxHeight
                    ? prev
                    : next;
            });
        });
    }, []);

    const startFollow = React.useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        const tick = () => {
            recalc();
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    }, [recalc]);

    const stopFollow = React.useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
    }, []);

    const openMenu = () => {
        setOpen(true);
        recalc();
        startFollow();
    };
    const closeMenu = () => {
        setOpen(false);
        stopFollow();
        setPos(null);
    };

    React.useEffect(() => {
        if (!open) return;

        if (Platform.OS === "web") {
            const onFocus = () => recalc();
            const onVis = () => {
                if (!document.hidden) recalc();
            };
            const onFS = () => recalc();

            window.addEventListener("focus", onFocus);
            document.addEventListener("visibilitychange", onVis);
            document.addEventListener("fullscreenchange", onFS);
            return () => {
                window.removeEventListener("focus", onFocus);
                document.removeEventListener("visibilitychange", onVis);
                document.removeEventListener("fullscreenchange", onFS);
            };
        } else {
            const dimSub = Dimensions.addEventListener("change", recalc);
            const appSub = AppState.addEventListener("change", (s) => {
                if (s === "active") recalc();
            });
            return () => {
                dimSub?.remove?.();
                appSub?.remove?.();
            };
        }
    }, [open, recalc]);

    return (
        <View style={styles.wrap}>
            <Field label={label}>
                <View ref={anchorRef} collapsable={false}>
                    <Pill
                        onPress={openMenu}
                        text={current.name}
                        border={current.color}
                        icon={current.icon}
                    />
                </View>
            </Field>

            <Modal visible={open} transparent animationType="none" onRequestClose={closeMenu} statusBarTranslucent>
                <GestureHandlerRootView style={{ flex: 1 }}>
                <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}/>
                {pos && (
                    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                        <View style={[styles.popup, {left: pos.left - 20, top: pos.top, width: pos.width}]}>
                            <SelectionCard label={"Select " + label} style={styles.card}>
                                {typeof children === "function" ? children({ closeMenu }) : children}
                            </SelectionCard>
                        </View>
                    </View>
                )}
                </GestureHandlerRootView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: Platform.select({
        web: { width: 250 },
        default: { width: 230, alignSelf: "center" },
    }),
    popup: {position: "absolute"},
    card: {position: "relative"},
    list: {
        width: "100%",
        maxHeight: 500,
        ...(Platform.OS === "web" ? {
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#2A2A2A #000000",
            scrollbarGutter: "stable",
        } : null),
    },
    listContent: {paddingRight: 5},
    sep: {height: 15},
    selected: {borderWidth: 3, opacity: 0.9},
});
