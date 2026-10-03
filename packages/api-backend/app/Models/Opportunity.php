<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Support\Facades\Event;
use App\Listeners\SyncUserPostCount;

    #[Fillable([
    'user_id',
    'investor_id',
    'invested_amount',
    'title',
    'company',
    'sector',
    'location',
    'funding_goal',
    'description',
    'timeline',
    'image',
    'status',
    ])]
class Opportunity extends Model
{
    protected $table = 'opportunities';

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function investor()
    {
        return $this->belongsTo(User::class, 'investor_id');
    }

    /**
     * Every investor connection (saved or funded) on this post.
     */
    public function connections()
    {
        return $this->hasMany(ConnectedOpportunity::class);
    }

    /**
     * Connections that have actually put money in (investment_amount sums
     * each investor's validated payments).
     */
    public function investments()
    {
        return $this->hasMany(ConnectedOpportunity::class)->where('investment_amount', '>', 0);
    }

    /**
     * Keep the founder's cached post count correct whenever a post is added or
     * removed, whichever controller does it.
     */
    protected static function booted(): void
    {
        $listener = new SyncUserPostCount();

        static::created(fn (Opportunity $opportunity) => $listener->handleCreated($opportunity));
        static::deleted(fn (Opportunity $opportunity) => $listener->handleDeleted($opportunity));
    }
}
