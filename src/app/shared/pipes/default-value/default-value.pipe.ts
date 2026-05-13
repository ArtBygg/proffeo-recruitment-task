import { Pipe, PipeTransform } from '@angular/core';
import { isEmpty } from 'lodash';

export type DefaultPipeValueType = string | number;

/**
 *
 * DefaultValuePipe return unchanged value if truthy otherwise return default placeholder value.
 *
 * @export
 * @class DefaultPipe
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'appDefaultValue'
})
export class DefaultValuePipe implements PipeTransform {
  /**
   * Transform method
   *
   * @param value
   * @param [defaultValue='-']
   * @return
   * @memberof DefaultPipe
   */
  public transform(value: DefaultPipeValueType, defaultValue: DefaultPipeValueType = '-'): DefaultPipeValueType {
    return !isEmpty(value) ? value : defaultValue;
  }
}
