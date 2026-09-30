<?php

namespace App\Support;

class FundingGoal
{
    /**
     * Turn a human funding goal such as "$1.5M" or "250K" into a plain number.
     *
     * Lives here rather than on a controller because the escrow payout
     * calculation needs the same interpretation of the goal as the investor
     * payment validation does.
     */
    public static function parse($value): float
    {
        $raw = (string) $value;
        $num = (float) preg_replace('/[^0-9.]/', '', $raw);

        if ($num === 0.0) {
            return 0.0;
        }

        $suffix = strtoupper(preg_replace('/[0-9.,$ ]/', '', $raw));

        if (str_contains($suffix, 'B')) {
            return $num * 1000000000;
        }
        if (str_contains($suffix, 'M')) {
            return $num * 1000000;
        }
        if (str_contains($suffix, 'K')) {
            return $num * 1000;
        }

        return $num;
    }
}
