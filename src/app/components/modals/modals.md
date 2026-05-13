# MODALS

## GENERAL GUIDELINES

### Core Principles

1. **Dumb Components**: Modal components should be _dumb components_ that only receive data to display and allow select/edit/add actions to be performed on that data.
2. **Shared Base Component**: All created modals should use shared `modal.component` as their base.
3. **No Direct API Calls**: Modals NEVER perform API CRUD actions that call Data services directly.
   - **Exception**: GET methods from data services are allowed if the modal needs to retrieve additional data (e.g., dropdown options)
   - **Preferred approach**: Move data retrieval to the parent component and pass it through ModalData interfaces
4. **Centralized Location**: All modals MUST be kept inside `app/components/modals` folder for better discoverability and to avoid duplication.

### Modal Types

- **Select Modals**: For entity selection (single or multiple, use `SelectMode` enum when needed)
- **Form Modals**: For creating or editing entities (when both actions operate on the same form)
- **Confirmation Modals**: For confirming actions

### SELECT-TYPE MODALS

Modals that allow for entity selection (e.g. `select-industry-modal`, `select-groups-modal`) use `select-entity-list` components inside.

**Guidelines for select modals:**

- Use consistent naming: `select-[entity]-modal`
- Support both single and multi-select modes through configuration when needed
- Implement search functionality when dealing with large datasets
- Always return the selected items in a consistent format

## MODAL.SERVICE

### Purpose

The `modal.service` serves as a centralized service for opening all modals in the application. This approach:

- Makes it easier to find existing modals
- Provides a consistent API for modal operations
- Allows tracking of which components use which modals
- Enables easier testing and mocking

### Implementation Guidelines

1. All methods in `modal.service` MUST return a reference to the opened MatDialogRef
2. Method naming convention: `open[ModalName]()` (e.g., `openSelectIndustryModal()`)

### Example Method Structure

```typescript
/**
 * Opens the industry selection modal
 * @param data - Modal configuration and initial data
 * @returns MatDialogRef with selected industry
 * @example
 * const dialogRef = this.modalService.openSelectIndustryModal({
*   industries: Signal<Industry[]>;
    selectedIndustry?: Industry;
 * });
 */
openSelectIndustryModal(data: SelectIndustryModalData): MatDialogRef<SelectIndustryModalComponent, Industry> {
  return this.dialog.open(SelectIndustryModalComponent, { data });
}
```

## NEXT STEPS

All modals should be refactored to fit the guidelines.

- moved to the `app/components/modals` folder
- their CRUD logic moved to parent component that uses them

## REFACTOR STATUS

Modals following the guidelines:

- `select-industry-modal`
- `estimation-modal`
- `select-single-location-modal`
- `select-groups-modal`
- `tag-form-modal`

Modals to refactor:

- `SelectUserToCompanyGroupModalComponent`
