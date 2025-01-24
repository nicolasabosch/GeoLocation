import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterValueByArray',
    pure: false,
    standalone: true
})

export class filterValueByArrayPipe implements PipeTransform {

        transform(items: any[], fieldName: string, values: any[]) {
            if (!values || values.length === 0) {
              return items;
            }
            var filtered: any[] = [];
            items.forEach((item) => {
              try {
                if (item[fieldName] === null) {
                  if (
                    values.some(function (e) {
                      return e === null;
                    })
                  )
                    filtered.push(item);
                } else {
                  var noNullValue = values.filter(function (e) {
                    return e !== null;
                  });
                  if (
                    noNullValue.some(function (e) {
                      return e.toString() === item[fieldName].toString();
                    })
                  )
                    filtered.push(item);
                }
              } catch (e) {}
            });
        
            return filtered;
          }

    }
    


