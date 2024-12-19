import { ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that filters an array of objects based on given filter criteria.
 * It is marked as impure so it will always execute whenever change detection runs.
 *  @example
 *      <div class="dropdown-divider"
            *ngIf="(crudService.UserMenuList | filter:{'MenuBarID': menuBar.MenuBarID} | filter:{GroupNumber:2}).length > 0">
        </div>
 */
@Pipe({
  name: 'filter',
  pure: false,
  standalone: true
})
export class FilterPipe implements PipeTransform {
 /**
   * Filter an array of objects .
   * @param value - The input array of objects to be filtered.
   * @param filterNameAux - The name or names of the properties to be filtered on. Can be a string or an array of strings. If an object is provided, the first key-value pair will be used as the filter name-value pair.
   * @param filterValue - The value or values to be filtered on. Can be a string or an array of strings. If the value starts with '!', it will negate the filter (i.e. exclude matching items).
   * @returns The filtered array of objects.
   */
  transform(value:any = [], filterNameAux: any, filterValue?: any): any {


    var filterName: string | string[];

    if (filterNameAux.constructor === Object) {

      filterName = [Object.entries(filterNameAux)[0][0]];
      filterValue = [Object.entries(filterNameAux)[0][1]];
    }
    else {
      filterName = Array.isArray(filterNameAux) ? filterNameAux : [filterNameAux];
      filterValue = Array.isArray(filterValue) ? filterValue : [filterValue];
    }

    let result = value;
    if (filterName[0] ==="ProjectTypeID")
    {
        console.log(filterValue);
    }

    if (filterValue[0]=== undefined || filterValue[0]===null)
    {
      return [];
    }

    if (filterName.some(filter => filter != null) && filterValue.some((filter: any) => filter != null)) {
      filterName.forEach((_fName: string, index: number) => {
        if ((typeof filterValue[index]==="string") && filterValue[index].indexOf("!") > -1) {
          result = result.filter((val: { [x: string]: any; }) => val[_fName] !== filterValue[index].toString().substring(1));
        }
        else {
          result = result.filter((val: { [x: string]: any; }) => val[_fName] === filterValue[index]);
        }

      });
    }
    return result;
  }

}
