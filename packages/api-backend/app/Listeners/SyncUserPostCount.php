<?php

namespace App\Listeners;

use App\Models\Opportunity;
use App\Models\User;

/**
 * Keeps the cached `users.posts` counter in step with the posts table.
 *
 * The column exists so lists can sort and filter on it cheaply, but a stored
 * count drifts the moment a post is added or removed, so it is recalculated
 * here rather than incremented/decremented. Recalculating is a cheap indexed
 * COUNT and cannot be thrown off by a missed event.
 */
class SyncUserPostCount
{
    /**
     * A post was created.
     */
    public function handleCreated(Opportunity $opportunity): void
    {
        $this->sync($opportunity->user_id);
    }

    /**
     * A post was removed.
     */
    public function handleDeleted(Opportunity $opportunity): void
    {
        $this->sync($opportunity->user_id);
    }

    protected function sync(?int $userId): void
    {
        if (! $userId) {
            return;
        }

        $count = Opportunity::where('user_id', $userId)->count();

        // An UPDATE keeps the updated_at audit trail honest; updateOrCreate
        // would not.
        User::where('id', $userId)->update(['posts' => $count]);
    }
}
