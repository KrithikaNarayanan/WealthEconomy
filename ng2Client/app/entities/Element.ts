﻿import { Logger } from "../services/logger.service";

export class Element {

    // Public - Server-side
    Id: number = 0;
    Name: string = "";
    get IsMainElement(): boolean {
        return this.fields.IsMainElement;
    }
    set IsMainElement(value: boolean) {

        if (this.fields.IsMainElement !== value) {
            this.fields.IsMainElement = value;

            // TODO When this prop set in constructor, ResourcePool is null, in such case, ignore
            // However, it would be better to always have a ResourcePool? / coni2k - 29 Nov. '15
            if (typeof (this as any).ResourcePool === "undefined" || (this as any).ResourcePool === null) {
                return;
            }

            // Main element check: If there is another element that its IsMainElement flag is true, make it false
            if (value) {
                (this as any).ResourcePool.ElementSet.forEach((element: any) => {
                    if (element !== this && element.IsMainElement) {
                        element.IsMainElement = false;
                    }
                });

                // Update selectedElement of resourcePool
                (this as any).ResourcePool.selectedElement(this);
            }
        }
    }
    // TODO breezejs - Cannot assign a navigation property in an entity ctor
    //(this as any).ResourcePool = null;
    //(this as any).ElementFieldSet = [];
    //(this as any).ElementItemSet = [];
    //(this as any).ParentFieldSet = [];

    private fields: {
        // Server-side
        IsMainElement: boolean,

        // Client-side
        parent: any,
        familyTree: any,
        elementFieldIndexSet: any,
        indexRating: any,
        directIncomeField: any,
        multiplierField: any,
        totalResourcePoolAmount: any
    } = {
        // Server-side
        IsMainElement: false,

        // Client-side
        parent: null,
        familyTree: null,
        elementFieldIndexSet: null,
        indexRating: null,
        directIncomeField: null,
        multiplierField: null,
        totalResourcePoolAmount: null
    };

    constructor(private logger: Logger) {
    }

    directIncome() {

        // TODO Check totalIncome notes

        var value = 0;
        (this as any).ElementItemSet.forEach((item: any) => {
            value += item.directIncome();
        });

        return value;
    }

    directIncomeField() {

        // TODO In case of add / remove fields?
        if (this.fields.directIncomeField === null) {
            this.setDirectIncomeField();
        }

        return this.fields.directIncomeField;
    }

    directIncomeIncludingResourcePoolAmount() {

        // TODO Check totalIncome notes

        var value = 0;
        (this as any).ElementItemSet.forEach((item: any) => {
            value += item.directIncomeIncludingResourcePoolAmount();
        });

        return value;
    }

    elementFieldIndexSet() {
        if (this.fields.elementFieldIndexSet === null) {
            this.setElementFieldIndexSet();
        }
        return this.fields.elementFieldIndexSet;
    }

    familyTree() {

        // TODO In case of add / remove elements?
        if (this.fields.familyTree === null) {
            this.setFamilyTree();
        }

        return this.fields.familyTree;
    }

    // UI related: Determines whether the chart & element details will use full row (col-md-4 vs col-md-12 etc.)
    // TODO Obsolete for the moment!
    fullSize() {
        return ((this as any).ElementFieldSet.length > 4) || this.elementFieldIndexSet().length > 2;
    }

    getElementFieldIndexSet(element: any) {

        var sortedElementFieldSet = element.getElementFieldSetSorted();
        var indexSet: any[] = [];

        // Validate
        sortedElementFieldSet.forEach((field: any) => {
            if (field.IndexEnabled) {
                indexSet.push(field);
            }

            if (field.DataType === 6 && field.SelectedElement !== null) {
                var childIndexSet = this.getElementFieldIndexSet(field.SelectedElement);

                childIndexSet.forEach((childIndex: any) => {
                    indexSet.push(childIndex);
                });
            }
        });

        return indexSet;
    }

    getElementFieldSetSorted(): any[] {
        return (this as any).ElementFieldSet.sort((a: any, b: any) => a.SortOrder - b.SortOrder);
    }

    getElementItemSetSorted(): any[] {
        return (this as any).ElementItemSet.sort((a: any, b: any) => {
            let nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
    }

    indexRating() {

        if (this.fields.indexRating === null) {
            this.setIndexRating(false);
        }

        return this.fields.indexRating;
    }

    multiplier() {

        // TODO Check totalIncome notes

        var value = 0;
        (this as any).ElementItemSet.forEach((item: any) => {
            value += item.multiplier();
        });

        return value;
    }

    multiplierField() {

        // TODO In case of add / remove field?
        if (this.fields.multiplierField === null) {
            this.setMultiplierField();
        }

        return this.fields.multiplierField;
    }

    parent() {

        // TODO In case of add / remove elements?
        if (this.fields.parent === null) {
            this.setParent();
        }

        return this.fields.parent;
    }

    resourcePoolAmount() {

        // TODO Check totalIncome notes

        var value = 0;
        (this as any).ElementItemSet.forEach((item: any) => {
            value += item.resourcePoolAmount();
        });

        return value;
    }

    setDirectIncomeField() {
        var result = (this as any).ElementFieldSet.filter((field: any) => field.DataType === 11);

        if (result.length > 0) {
            this.fields.directIncomeField = result[0];
        }
    }

    setElementFieldIndexSet() {
        this.fields.elementFieldIndexSet = this.getElementFieldIndexSet(this);
    }

    setFamilyTree() {

        this.fields.familyTree = [];

        var element = this;
        while (element !== null) {
            this.fields.familyTree.unshift(element);
            element = element.parent();
        }

        // TODO At the moment it's only upwards, later include children?
    }

    setIndexRating(updateRelated: any) {
        updateRelated = typeof updateRelated === "undefined" ? true : updateRelated;

        var indexSet = this.elementFieldIndexSet();

        var value = 0;
        indexSet.forEach((index: any) => {
            value += index.indexRating();
        });

        if (this.fields.indexRating !== value) {
            this.fields.indexRating = value;

            // Update related
            if (updateRelated) {
                this.elementFieldIndexSet().forEach((index: any) => {
                    index.setIndexRatingPercentage();
                });
            }
        }
    }

    setMultiplierField() {
        var result = (this as any).ElementFieldSet.filter((field: any) => field.DataType === 12);

        if (result.length > 0) {
            this.fields.multiplierField = result[0];
        }
    }

    setParent() {
        if ((this as any).ParentFieldSet.length > 0) {
            this.fields.parent = (this as any).ParentFieldSet[0].Element;
        }
    }

    totalDirectIncome() {

        // TODO Check totalIncome notes

        var value = 0;
        (this as any).ElementItemSet.forEach((item: any) => {
            value += item.totalDirectIncome();
        });

        return value;
    }

    totalDirectIncomeIncludingResourcePoolAmount() {

        // TODO Check totalIncome notes

        var value = 0;
        (this as any).ElementItemSet.forEach((item: any) => {
            value += item.totalDirectIncomeIncludingResourcePoolAmount();
        });

        return value;
    }

    totalIncome() {

        // TODO If elementItems could set their parent element's totalIncome when their totalIncome changes, it wouldn't be necessary to sum this result everytime?

        var value = 0;
        (this as any).ElementItemSet.forEach((item: any) => {
            value += item.totalIncome();
        });

        return value;
    }

    totalIncomeAverage() {

        // Validate
        if ((this as any).ElementItemSet.length === 0) {
            return 0;
        }

        return this.totalIncome() / (this as any).ElementItemSet.length;
    }

    // TODO This is out of pattern!
    totalResourcePoolAmount() {

        // TODO Check totalIncome notes

        var value: any;

        if (this === (this as any).ResourcePool.mainElement()) {

            value = (this as any).ResourcePool.InitialValue;

            (this as any).ElementItemSet.forEach((item: any) => {
                value += item.totalResourcePoolAmount();
            });

        } else {
            if ((this as any).ResourcePool.mainElement() !== null) {
                value = (this as any).ResourcePool.mainElement().totalResourcePoolAmount();
            }
        }

        //logger.log("TRPA-A " + value.toFixed(2));

        if (this.fields.totalResourcePoolAmount !== value) {
            this.fields.totalResourcePoolAmount = value;

            //logger.log("TRPA-B " + value.toFixed(2));

            this.elementFieldIndexSet().forEach((field: any) => {
                // TODO How about this check?
                // if (field.DataType === 11) { - 
                field.setIndexIncome();
                // }
            });
        }

        return value;
    }
}
