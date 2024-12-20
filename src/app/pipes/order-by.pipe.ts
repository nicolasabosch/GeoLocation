import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that orders an array of objects.
 * @example
 *   <option [ngValue]="T.LanguageID" *ngFor="let T of languageList | orderBy:'LanguageName'">{{
           T.LanguageName }}</option>
 */
@Pipe({
  name: 'orderBy',
  pure: false,
  standalone: true

})
export class OrderByPipe implements PipeTransform {
    /**
   * Sorts an array of objects by one or more fields
   * @param array - The array to sort
   * @param fields - One or more fields to sort by. Prefix the field name with a '-' to sort in descending order
   * @returns The sorted array
   */
  transform(array: any[], fields: any): any[] {
      if (!array)
      {
        return [];
      }


    if (fields) {
      fields = Array.isArray(fields) ? fields : [fields];
      if (fields.length > 0) {
        return array.sort(this.fieldSorter(fields));
      }
      else {
        return array;
      }
    }
    else {
      return array;
    }
  }

  /**
   * Returns a sorting function that can be used to sort an array of objects by multiple fields
   * @param fields - One or more fields to sort by. Prefix the field name with a '-' to sort in descending order
   * @returns The sorting function
   */
  fieldSorter(fields: any[]) {
    return function (a: { [x: string]: number; }, b: { [x: string]: number; }) {
      return fields
        .map(function (o) {
          var dir = 1;
          if (o[0] === '-') {
            dir = -1;
            o = o.substring(1);
          }
          if (a[o]===null ) return -(dir);
          if (b[o]===null ) return (dir);

          if (a[o] > b[o] ) return dir;
          if (a[o] < b[o]) return -(dir);
          return 0;
        })
        .reduce(function firstNonZeroValue(p, n) {
          return p ? p : n;
        }, 0);
    };
  }
}
