<?php

namespace App\Http\Requests\Admin;

use App\Enums\Party;
use App\Enums\RecordStatus;
use App\Traits\ValidatesPuJurisdiction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateResultRequest extends FormRequest
{
    use ValidatesPuJurisdiction;
    
    /**
     * Determine if the user is authorized to make this request.
     */

    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('result')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'election_id' => ['required', 'string', 'exists:elections,id'],
            'pu_id' => [
                'required', 'string', 'exists:pus,id',
                Rule::unique('results')->where('election_id', $this->input('election_id')),
            ],
            'total_votes'   => ['required', 'integer', 'min:0'],
            'party_votes'   => ['nullable', 'array'],
            'party_votes.*' => ['integer', 'min:0'],
            'status'        => ['required', Rule::enum(RecordStatus::class)],
            'image'         => ['nullable', 'image', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $this->validatePuJurisdiction($validator);

        $validator->after(function ($validator) {
            $partyVotes = $this->input('party_votes', []);

            // Every key must be a recognized party code.
            $validParties = collect(Party::cases())->map(fn($p) => $p->value)->all();
            foreach (array_keys($partyVotes) as $party) {
                if (!in_array($party, $validParties, true)) {
                    $validator->errors()->add('party_votes', "\"{$party}\" is not a recognized party.");
                    break;
                }
            }

            $sum   = collect($partyVotes)->sum();
            $total = (int) $this->input('total_votes', 0);

            if ($sum > 0 && $sum > $total) {
                $validator->errors()->add('party_votes', 'Sum of party votes cannot exceed total votes.');
            }
        });
    }
}
