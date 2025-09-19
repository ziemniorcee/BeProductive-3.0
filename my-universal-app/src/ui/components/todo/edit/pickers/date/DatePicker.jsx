import React from "react";
import EditPicker from "../common/EditPicker";
import DatePickerContent from "./DatePickerContent";

export default function DatePicker({ app,date }) {
    let current = {name: date ?? "No date"};
    let label = "Date"

    return (
        <EditPicker label={label} current={current}>
            {({ closeMenu }) => (
                <DatePickerContent
                    current={current}
                    onPick={closeMenu}
                />
            )}
        </EditPicker>
    );
}
