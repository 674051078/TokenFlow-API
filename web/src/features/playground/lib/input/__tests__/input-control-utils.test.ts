/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  getInputControlState,
  isPlaygroundModelAvailable,
} from '../input-control-utils.ts'

const qwenModels = [{ label: 'qwen-plus', value: 'qwen-plus' }]

describe('playground model submission guard', () => {
  test('rejects empty and stale model selections', () => {
    assert.equal(isPlaygroundModelAvailable([], ''), false)
    assert.equal(isPlaygroundModelAvailable(qwenModels, 'deepseek-chat'), false)
  })

  test('allows submission only when the selected model is available', () => {
    const state = getInputControlState({
      groups: [{ label: 'default', value: 'default', ratio: 1 }],
      hasStopHandler: true,
      modelValue: 'qwen-plus',
      models: qwenModels,
      text: '你好',
    })

    assert.equal(state.canSubmit, true)
  })

  test('blocks keyboard submission when no selected model is available', () => {
    const state = getInputControlState({
      groups: [{ label: 'default', value: 'default', ratio: 1 }],
      hasStopHandler: true,
      modelValue: '',
      models: [],
      text: '你好',
    })

    assert.equal(state.canSubmit, false)
  })
})
